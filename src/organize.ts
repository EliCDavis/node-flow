import { Camera } from "./camera";
import { FlowNode } from "./node";
import { NodeSubsystem } from "./nodes/subsystem";
import { Box } from "./types/box";
import { Vector2 } from "./types/vector2";

const widthSpacing = 100;
const heightSpacing = 50;

/**
 * How many times to sweep the graph re-ordering each layer by where its
 * neighbours sit. Crossings drop quickly and then stop improving, so there
 * is no reason to keep going.
 */
const orderingSweeps = 8;

export interface Layout {
    /** Indices into the node array, one list per layer, left to right. */
    layers: Array<Array<number>>;
    /** Which layer each node landed in, by node index. */
    layerOf: Map<number, number>;
}

/**
 * Orders the nodes so every edge points from an earlier node to a later one,
 * as far as that is possible. Edges that would point backwards - the ones
 * closing a cycle - are the ones left out, which is what keeps a cyclic
 * graph from hanging or stacking into one column.
 */
export function topologicalOrder(sorting: Array<number>, upstream: Map<number, Array<number>>): Array<number> {
    const visited = new Set<number>();
    const order = new Array<number>();

    // Iterative: a deep graph would blow the stack recursing.
    for (const root of sorting) {
        if (visited.has(root)) {
            continue;
        }

        const stack: Array<{ node: number, expanded: boolean }> = [{ node: root, expanded: false }];
        while (stack.length > 0) {
            const top = stack[stack.length - 1];

            if (top.expanded) {
                stack.pop();
                order.push(top.node);
                continue;
            }

            top.expanded = true;
            if (visited.has(top.node)) {
                stack.pop();
                continue;
            }
            visited.add(top.node);

            const feeders = upstream.get(top.node);
            if (feeders === undefined) {
                continue;
            }
            for (const feeder of feeders) {
                if (!visited.has(feeder)) {
                    stack.push({ node: feeder, expanded: false });
                }
            }
        }
    }

    return order;
}

/**
 * Puts every node one layer to the right of the furthest node feeding it, so
 * a node never sits left of something it consumes. Taking the furthest and
 * not the first is what keeps a long chain and a short chain that rejoin
 * from landing on top of each other.
 */
export function assignLayers(sorting: Array<number>, upstream: Map<number, Array<number>>): Layout {
    const order = topologicalOrder(sorting, upstream);
    const placed = new Set<number>();
    const layerOf = new Map<number, number>();

    for (const node of order) {
        let layer = 0;
        for (const feeder of upstream.get(node) ?? []) {
            // Only feeders already placed: anything else is a back edge, and
            // following it would mean waiting on a node that waits on this one.
            if (placed.has(feeder)) {
                layer = Math.max(layer, (layerOf.get(feeder) as number) + 1);
            }
        }
        layerOf.set(node, layer);
        placed.add(node);
    }

    let deepest = 0;
    for (const layer of layerOf.values()) {
        deepest = Math.max(deepest, layer);
    }

    const layers = new Array<Array<number>>(deepest + 1);
    for (let i = 0; i < layers.length; i++) {
        layers[i] = new Array<number>();
    }
    for (const node of order) {
        layers[layerOf.get(node) as number].push(node);
    }

    return { layers, layerOf };
}

/**
 * Reorders each layer so nodes sit across from the ones they connect to,
 * by repeatedly moving every node to the average position of its neighbours
 * in the layer before it, then the layer after it. This is what stops the
 * edges crossing over each other.
 */
export function orderWithinLayers(
    layout: Layout,
    upstream: Map<number, Array<number>>,
    downstream: Map<number, Array<number>>,
): void {
    const slotOf = new Map<number, number>();
    const recordSlots = (): void => {
        for (const layer of layout.layers) {
            for (let i = 0; i < layer.length; i++) {
                slotOf.set(layer[i], i);
            }
        }
    };
    recordSlots();

    const meanSlot = (node: number, neighbours: Map<number, Array<number>>, layer: number): number => {
        let total = 0;
        let count = 0;
        for (const neighbour of neighbours.get(node) ?? []) {
            // Only neighbours in the adjacent layer say anything about where
            // this node should sit; one several layers away does not.
            if (layout.layerOf.get(neighbour) !== layer) {
                continue;
            }
            total += slotOf.get(neighbour) as number;
            count++;
        }
        return count === 0 ? -1 : total / count;
    };

    const sweep = (neighbours: Map<number, Array<number>>, towards: number): void => {
        for (let i = 0; i < layout.layers.length; i++) {
            const index = towards > 0 ? i : layout.layers.length - 1 - i;
            const adjacent = index + towards;
            if (adjacent < 0 || adjacent >= layout.layers.length) {
                continue;
            }

            const layer = layout.layers[index];
            const keys = new Map<number, number>();
            for (const node of layer) {
                const mean = meanSlot(node, neighbours, adjacent);
                // A node with nothing in the adjacent layer keeps its place
                // rather than being dragged to the top.
                keys.set(node, mean === -1 ? (slotOf.get(node) as number) : mean);
            }

            layer.sort((a, b) => (keys.get(a) as number) - (keys.get(b) as number));
            for (let s = 0; s < layer.length; s++) {
                slotOf.set(layer[s], s);
            }
        }
    };

    for (let i = 0; i < orderingSweeps; i++) {
        sweep(upstream, -1);
        sweep(downstream, 1);
    }
}

export function Organize(ctx: CanvasRenderingContext2D, graph: NodeSubsystem, nodesToSort?: Array<number>): void {
    const nodes = graph.getNodes();
    if (nodes.length === 0) {
        return;
    }

    const sorting = new Array<number>();
    if (nodesToSort) {
        if (nodesToSort.length < 2) {
            return;
        }
        for (const index of nodesToSort) {
            if (index >= 0 && index < nodes.length) {
                sorting.push(index);
            }
        }
    } else {
        for (let i = 0; i < nodes.length; i++) {
            sorting.push(i);
        }
    }
    if (sorting.length < 2) {
        return;
    }

    const inLayout = new Set<number>(sorting);
    const nodeLUT = new Map<FlowNode, number>();
    for (let i = 0; i < nodes.length; i++) {
        nodeLUT.set(nodes[i], i);
    }

    const camera = new Camera();
    const bounds = new Map<number, Box>();
    for (const index of sorting) {
        bounds.set(index, nodes[index].calculateBounds(ctx, camera));
    }

    // Edges, restricted to what is being laid out. Organizing a selection
    // must not be steered by nodes that are staying where they are.
    const upstream = new Map<number, Array<number>>();
    const downstream = new Map<number, Array<number>>();
    for (const index of sorting) {
        const feeders = new Array<number>();
        for (const feeder of graph.connectedInputsNodeReferencesByIndex(index)) {
            const feederIndex = nodeLUT.get(feeder);
            if (feederIndex !== undefined && inLayout.has(feederIndex) && feederIndex !== index) {
                feeders.push(feederIndex);
            }
        }
        upstream.set(index, feeders);

        const consumers = new Array<number>();
        for (const consumer of graph.connectedOutputsNodeReferences(index)) {
            const consumerIndex = nodeLUT.get(consumer);
            if (consumerIndex !== undefined && inLayout.has(consumerIndex) && consumerIndex !== index) {
                consumers.push(consumerIndex);
            }
        }
        downstream.set(index, consumers);
    }

    const layout = assignLayers(sorting, upstream);
    orderWithinLayers(layout, upstream, downstream);

    // Keep the result where the nodes already were, so organizing a
    // selection doesn't fling it off to wherever the origin happens to be.
    let anchor: Vector2 = { x: 0, y: 0 };
    for (const index of sorting) {
        const position = nodes[index].getPosition();
        anchor.x += position.x;
        anchor.y += position.y;
    }
    anchor.x /= sorting.length;
    anchor.y /= sorting.length;

    const layerWidths = layout.layers.map(layer =>
        layer.reduce((widest, node) => Math.max(widest, (bounds.get(node) as Box).Size.x), 0));
    const layerHeights = layout.layers.map(layer =>
        layer.reduce((total, node) => total + (bounds.get(node) as Box).Size.y + heightSpacing, -heightSpacing));

    const totalWidth = layerWidths.reduce((total, width) => total + width + widthSpacing, -widthSpacing);
    const tallest = layerHeights.reduce((tallest, height) => Math.max(tallest, height), 0);

    // Inputs on the left, consumers to their right, every layer centered
    // against the tallest one so the graph reads as a band rather than
    // hanging off a single corner.
    let x = anchor.x - (totalWidth / 2);
    for (let i = 0; i < layout.layers.length; i++) {
        let y = anchor.y - (tallest / 2) + ((tallest - layerHeights[i]) / 2);

        for (const node of layout.layers[i]) {
            const size = (bounds.get(node) as Box).Size;
            nodes[node].setPosition({ x: x + ((layerWidths[i] - size.x) / 2), y: y });
            y += size.y + heightSpacing;
        }

        x += layerWidths[i] + widthSpacing;
    }
}
