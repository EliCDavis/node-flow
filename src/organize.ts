import { Camera } from "./camera";
import { FlowNode } from "./node";
import { NodeSubsystem } from "./nodes/subsystem";
import { Vector2 } from "./types/vector2";

const widthSpacing = 100;
const heightSpacing = 50;
const laneSpacing = 25;
const pieceSpacing = 150;
const orderingSweeps = 8;
const placementSweeps = 8;

export interface Layout {
    /** Indices into the node array, one list per layer, left to right. */
    layers: Array<Array<number>>;
    /** Which layer each node landed in, by node index. */
    layerOf: Map<number, number>;
}

type Edges = Map<number, Array<number>>;

export function topologicalOrder(sorting: Array<number>, upstream: Edges): Array<number> {
    const visited = new Set<number>();
    const order = new Array<number>();

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

            for (const feeder of upstream.get(top.node) ?? []) {
                if (!visited.has(feeder)) {
                    stack.push({ node: feeder, expanded: false });
                }
            }
        }
    }

    return order;
}

function consumersOf(sorting: Array<number>, upstream: Edges): Edges {
    const downstream: Edges = new Map();
    for (const node of sorting) {
        downstream.set(node, []);
    }
    for (const node of sorting) {
        for (const feeder of upstream.get(node) ?? []) {
            const consumers = downstream.get(feeder);
            if (consumers !== undefined && !consumers.includes(node)) {
                consumers.push(node);
            }
        }
    }
    return downstream;
}

/**
 * Puts every node in the layer just left of its leftmost consumer, so an
 * input sits beside what it feeds rather than at the far left. Nodes nothing
 * consumes sit just right of their feeders.
 */
export function assignLayers(sorting: Array<number>, upstream: Edges): Layout {
    const downstream = consumersOf(sorting, upstream);
    const order = topologicalOrder(sorting, downstream);
    const placed = new Set<number>();
    const rank = new Map<number, number>();

    for (const node of order) {
        let r = 0;
        for (const consumer of downstream.get(node) ?? []) {
            if (placed.has(consumer)) {
                r = Math.max(r, (rank.get(consumer) as number) + 1);
            }
        }
        rank.set(node, r);
        placed.add(node);
    }

    let deepest = 0;
    for (const r of rank.values()) {
        deepest = Math.max(deepest, r);
    }

    const layerOf = new Map<number, number>();
    for (const node of sorting) {
        layerOf.set(node, deepest - (rank.get(node) as number));
    }

    for (const node of sorting) {
        const layer = layerOf.get(node) as number;
        if ((downstream.get(node) ?? []).some((c) => (layerOf.get(c) as number) > layer)) {
            continue;
        }
        let pulled = -1;
        for (const feeder of upstream.get(node) ?? []) {
            const feederLayer = layerOf.get(feeder);
            if (feederLayer !== undefined && feederLayer < layer) {
                pulled = Math.max(pulled, feederLayer + 1);
            }
        }
        if (pulled >= 0) {
            layerOf.set(node, pulled);
        }
    }

    const used = [...new Set(layerOf.values())].sort((a, b) => a - b);
    const compact = new Map<number, number>();
    used.forEach((layer, i) => compact.set(layer, i));

    const layers = used.map(() => new Array<number>());
    for (const node of sorting) {
        const layer = compact.get(layerOf.get(node) as number) as number;
        layerOf.set(node, layer);
        layers[layer].push(node);
    }

    return { layers, layerOf };
}

function crossingsOf(layout: Layout, downstream: Edges): number {
    const slotOf = new Map<number, number>();
    for (const layer of layout.layers) {
        layer.forEach((node, slot) => slotOf.set(node, slot));
    }

    let total = 0;
    for (let i = 0; i + 1 < layout.layers.length; i++) {
        const spans = new Array<[number, number]>();
        for (const node of layout.layers[i]) {
            for (const consumer of downstream.get(node) ?? []) {
                if (layout.layerOf.get(consumer) === i + 1) {
                    spans.push([slotOf.get(node) as number, slotOf.get(consumer) as number]);
                }
            }
        }
        for (let a = 0; a < spans.length; a++) {
            for (let b = a + 1; b < spans.length; b++) {
                if ((spans[a][0] - spans[b][0]) * (spans[a][1] - spans[b][1]) < 0) {
                    total++;
                }
            }
        }
    }
    return total;
}

/**
 * Reorders each layer so nodes sit across from the ones they connect to,
 * sweeping back and forth and keeping whichever order crossed the fewest
 * wires.
 */
export function orderWithinLayers(layout: Layout, upstream: Edges, downstream: Edges): void {
    const slotOf = new Map<number, number>();
    for (const layer of layout.layers) {
        for (let i = 0; i < layer.length; i++) {
            slotOf.set(layer[i], i);
        }
    }

    const meanSlot = (node: number, neighbours: Edges, layer: number): number => {
        let total = 0;
        let count = 0;
        for (const neighbour of neighbours.get(node) ?? []) {
            if (layout.layerOf.get(neighbour) !== layer) {
                continue;
            }
            total += slotOf.get(neighbour) as number;
            count++;
        }
        return count === 0 ? -1 : total / count;
    };

    const sweep = (neighbours: Edges, towards: number): void => {
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
                keys.set(node, mean === -1 ? (slotOf.get(node) as number) : mean);
            }

            layer.sort((a, b) => (keys.get(a) as number) - (keys.get(b) as number));
            for (let s = 0; s < layer.length; s++) {
                slotOf.set(layer[s], s);
            }
        }
    };

    let best = layout.layers.map((layer) => layer.slice());
    let fewest = crossingsOf(layout, downstream);
    for (let i = 0; i < orderingSweeps && fewest > 0; i++) {
        sweep(upstream, -1);
        sweep(downstream, 1);
        const crossings = crossingsOf(layout, downstream);
        if (crossings < fewest) {
            fewest = crossings;
            best = layout.layers.map((layer) => layer.slice());
        }
    }

    for (let i = 0; i < best.length; i++) {
        layout.layers[i] = best[i];
    }
}

export function findPieces(sorting: Array<number>, upstream: Edges, downstream: Edges): Array<Array<number>> {
    const rankOf = new Map<number, number>();
    sorting.forEach((node, i) => rankOf.set(node, i));

    const seen = new Set<number>();
    const pieces = new Array<Array<number>>();
    for (const start of sorting) {
        if (seen.has(start)) {
            continue;
        }
        seen.add(start);
        const piece = new Array<number>();
        const stack = [start];
        while (stack.length > 0) {
            const node = stack.pop() as number;
            piece.push(node);
            for (const neighbour of [...(upstream.get(node) ?? []), ...(downstream.get(node) ?? [])]) {
                if (rankOf.has(neighbour) && !seen.has(neighbour)) {
                    seen.add(neighbour);
                    stack.push(neighbour);
                }
            }
        }
        piece.sort((a, b) => (rankOf.get(a) as number) - (rankOf.get(b) as number));
        pieces.push(piece);
    }
    return pieces;
}

function treeRoot(piece: Array<number>, downstream: Edges): number | undefined {
    let root: number | undefined;
    for (const node of piece) {
        const consumers = downstream.get(node) ?? [];
        if (consumers.length > 1) {
            return undefined;
        }
        if (consumers.length === 0) {
            if (root !== undefined) {
                return undefined;
            }
            root = node;
        }
    }
    return root;
}

function columnXs(widths: Array<number>): Array<number> {
    const xs = new Array<number>();
    let x = 0;
    for (const width of widths) {
        xs.push(x);
        x += width + widthSpacing;
    }
    return xs;
}

function layoutTree(root: number, upstream: Edges, sizes: Map<number, Vector2>): Map<number, Vector2> {
    const children = (node: number): Array<number> => [...new Set(upstream.get(node) ?? [])];

    const depthOf = new Map<number, number>([[root, 0]]);
    const preorder = new Array<number>();
    const stack = [root];
    let deepest = 0;
    while (stack.length > 0) {
        const node = stack.pop() as number;
        preorder.push(node);
        const kids = children(node);
        for (let i = kids.length - 1; i >= 0; i--) {
            const depth = (depthOf.get(node) as number) + 1;
            depthOf.set(kids[i], depth);
            deepest = Math.max(deepest, depth);
            stack.push(kids[i]);
        }
    }

    const widths = new Array<number>(deepest + 1).fill(0);
    for (const [node, depth] of depthOf) {
        widths[deepest - depth] = Math.max(widths[deepest - depth], (sizes.get(node) as Vector2).x);
    }
    const xs = columnXs(widths);

    const band = new Map<number, number>();
    const topInBand = new Map<number, number>();
    const childOffset = new Map<number, number>();
    for (let i = preorder.length - 1; i >= 0; i--) {
        const node = preorder[i];
        const height = (sizes.get(node) as Vector2).y;
        const kids = children(node);
        if (kids.length === 0) {
            band.set(node, height);
            topInBand.set(node, 0);
            continue;
        }

        let offset = 0;
        for (const kid of kids) {
            childOffset.set(kid, offset);
            offset += (band.get(kid) as number) + heightSpacing;
        }
        const centre = (kid: number) =>
            (childOffset.get(kid) as number) + (topInBand.get(kid) as number) + (sizes.get(kid) as Vector2).y / 2;
        let top = (centre(kids[0]) + centre(kids[kids.length - 1])) / 2 - height / 2;
        let shift = 0;
        if (top < 0) {
            shift = -top;
            top = 0;
            for (const kid of kids) {
                childOffset.set(kid, (childOffset.get(kid) as number) + shift);
            }
        }
        band.set(node, Math.max(offset - heightSpacing + shift, top + height));
        topInBand.set(node, top);
    }

    const positions = new Map<number, Vector2>();
    const bandTop = new Map<number, number>([[root, 0]]);
    for (const node of preorder) {
        const column = deepest - (depthOf.get(node) as number);
        const size = sizes.get(node) as Vector2;
        positions.set(node, {
            x: xs[column] + (widths[column] - size.x) / 2,
            y: (bandTop.get(node) as number) + (topInBand.get(node) as number),
        });
        for (const kid of children(node)) {
            bandTop.set(kid, (bandTop.get(node) as number) + (childOffset.get(kid) as number));
        }
    }
    return positions;
}

function isotonic(targets: Array<number>): Array<number> {
    const blocks = new Array<{ sum: number, count: number }>();
    for (const target of targets) {
        blocks.push({ sum: target, count: 1 });
        while (blocks.length > 1) {
            const last = blocks[blocks.length - 1];
            const before = blocks[blocks.length - 2];
            if (before.sum / before.count <= last.sum / last.count) {
                break;
            }
            before.sum += last.sum;
            before.count += last.count;
            blocks.pop();
        }
    }
    const result = new Array<number>();
    for (const block of blocks) {
        for (let i = 0; i < block.count; i++) {
            result.push(block.sum / block.count);
        }
    }
    return result;
}

function median(values: Array<number>): number {
    const sorted = values.slice().sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 1 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

function layoutLayered(piece: Array<number>, upstream: Edges, downstream: Edges, sizes: Map<number, Vector2>): Map<number, Vector2> {
    const layout = assignLayers(piece, upstream);

    const up: Edges = new Map();
    const down: Edges = new Map();
    const heightOf = new Map<number, number>();
    for (const node of piece) {
        up.set(node, [...new Set(upstream.get(node) ?? [])]);
        down.set(node, [...new Set(downstream.get(node) ?? [])]);
        heightOf.set(node, (sizes.get(node) as Vector2).y);
    }

    let nextLane = -1;
    for (const from of piece) {
        const fromLayer = layout.layerOf.get(from) as number;
        const consumers = down.get(from) as Array<number>;
        for (let c = 0; c < consumers.length; c++) {
            const to = consumers[c];
            const toLayer = layout.layerOf.get(to) as number;
            if (toLayer - fromLayer < 2) {
                continue;
            }

            let previous = from;
            for (let layer = fromLayer + 1; layer < toLayer; layer++) {
                const lane = nextLane--;
                layout.layerOf.set(lane, layer);
                layout.layers[layer].push(lane);
                heightOf.set(lane, 0);
                up.set(lane, [previous]);
                down.set(lane, []);
                if (previous === from) {
                    consumers[c] = lane;
                } else {
                    (down.get(previous) as Array<number>).push(lane);
                }
                previous = lane;
            }
            (down.get(previous) as Array<number>).push(to);
            const feeders = up.get(to) as Array<number>;
            feeders[feeders.indexOf(from)] = previous;
        }
    }

    const sequence = new Map<number, number>();
    for (const sink of piece) {
        if ((down.get(sink) as Array<number>).length > 0) {
            continue;
        }
        const stack = [sink];
        while (stack.length > 0) {
            const node = stack.pop() as number;
            if (sequence.has(node)) {
                continue;
            }
            sequence.set(node, sequence.size);
            const feeders = up.get(node) ?? [];
            for (let i = feeders.length - 1; i >= 0; i--) {
                stack.push(feeders[i]);
            }
        }
    }
    for (const layer of layout.layers) {
        layer.sort((a, b) => (sequence.get(a) ?? Infinity) - (sequence.get(b) ?? Infinity));
    }

    orderWithinLayers(layout, up, down);

    const gapAfter = (above: number, below: number): number =>
        above < 0 || below < 0 ? laneSpacing : heightSpacing;

    const topOf = new Map<number, number>();
    for (const layer of layout.layers) {
        let y = 0;
        for (let i = 0; i < layer.length; i++) {
            topOf.set(layer[i], y);
            y += (heightOf.get(layer[i]) as number) + (i + 1 < layer.length ? gapAfter(layer[i], layer[i + 1]) : 0);
        }
        for (const node of layer) {
            topOf.set(node, (topOf.get(node) as number) - y / 2);
        }
    }

    const centreOf = (node: number) => (topOf.get(node) as number) + (heightOf.get(node) as number) / 2;

    const place = (layer: Array<number>, neighbours: Edges, adjacent: number): void => {
        const offsets = new Array<number>();
        const targets = new Array<number>();
        let offset = 0;
        for (let i = 0; i < layer.length; i++) {
            const node = layer[i];
            const centres = (neighbours.get(node) ?? [])
                .filter((n) => layout.layerOf.get(n) === adjacent)
                .map(centreOf);
            const desired = centres.length > 0
                ? median(centres) - (heightOf.get(node) as number) / 2
                : topOf.get(node) as number;
            offsets.push(offset);
            targets.push(desired - offset);
            if (i + 1 < layer.length) {
                offset += (heightOf.get(node) as number) + gapAfter(node, layer[i + 1]);
            }
        }
        const solved = isotonic(targets);
        for (let i = 0; i < layer.length; i++) {
            topOf.set(layer[i], solved[i] + offsets[i]);
        }
    };

    for (let s = 0; s < placementSweeps; s++) {
        if (s % 2 === 0) {
            for (let i = 1; i < layout.layers.length; i++) {
                place(layout.layers[i], up, i - 1);
            }
        } else {
            for (let i = layout.layers.length - 2; i >= 0; i--) {
                place(layout.layers[i], down, i + 1);
            }
        }
    }

    const widths = layout.layers.map((layer) =>
        layer.reduce((widest, node) => node < 0 ? widest : Math.max(widest, (sizes.get(node) as Vector2).x), 0));
    const xs = columnXs(widths);

    const positions = new Map<number, Vector2>();
    for (const node of piece) {
        const layer = layout.layerOf.get(node) as number;
        positions.set(node, {
            x: xs[layer] + (widths[layer] - (sizes.get(node) as Vector2).x) / 2,
            y: topOf.get(node) as number,
        });
    }
    return positions;
}

function layoutLoose(loose: Array<number>, sizes: Map<number, Vector2>): Map<number, Vector2> {
    const columns = Math.ceil(Math.sqrt(loose.length));
    const widths = new Array<number>(columns).fill(0);
    const heights = new Array<number>(Math.ceil(loose.length / columns)).fill(0);
    loose.forEach((node, i) => {
        const size = sizes.get(node) as Vector2;
        widths[i % columns] = Math.max(widths[i % columns], size.x);
        heights[Math.floor(i / columns)] = Math.max(heights[Math.floor(i / columns)], size.y);
    });

    const xs = new Array<number>();
    let x = 0;
    for (const width of widths) {
        xs.push(x);
        x += width + heightSpacing;
    }
    const ys = new Array<number>();
    let y = 0;
    for (const height of heights) {
        ys.push(y);
        y += height + heightSpacing;
    }

    const positions = new Map<number, Vector2>();
    loose.forEach((node, i) => positions.set(node, { x: xs[i % columns], y: ys[Math.floor(i / columns)] }));
    return positions;
}

interface Block {
    positions: Map<number, Vector2>;
    size: Vector2;
}

function toBlock(positions: Map<number, Vector2>, sizes: Map<number, Vector2>): Block {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const [node, position] of positions) {
        const size = sizes.get(node) as Vector2;
        minX = Math.min(minX, position.x);
        minY = Math.min(minY, position.y);
        maxX = Math.max(maxX, position.x + size.x);
        maxY = Math.max(maxY, position.y + size.y);
    }
    const shifted = new Map<number, Vector2>();
    for (const [node, position] of positions) {
        shifted.set(node, { x: position.x - minX, y: position.y - minY });
    }
    return { positions: shifted, size: { x: maxX - minX, y: maxY - minY } };
}

/**
 * Lays out each connected piece on its own and packs the pieces into rows,
 * tallest first, with every unconnected node gathered into one grid at the
 * end. Positions are top-left corners, with the whole layout starting at the
 * origin.
 */
export function layoutGraph(
    sorting: Array<number>,
    upstream: Edges,
    downstream: Edges,
    sizes: Map<number, Vector2>,
): Map<number, Vector2> {
    const blocks = new Array<Block>();
    const loose = new Array<number>();
    for (const piece of findPieces(sorting, upstream, downstream)) {
        if (piece.length === 1) {
            loose.push(piece[0]);
            continue;
        }
        const root = treeRoot(piece, downstream);
        const positions = root !== undefined
            ? layoutTree(root, upstream, sizes)
            : layoutLayered(piece, upstream, downstream, sizes);
        blocks.push(toBlock(positions, sizes));
    }

    blocks.sort((a, b) => b.size.y - a.size.y || b.size.x - a.size.x);
    if (loose.length > 0) {
        blocks.push(toBlock(layoutLoose(loose, sizes), sizes));
    }

    let area = 0;
    let widest = 0;
    for (const block of blocks) {
        area += (block.size.x + pieceSpacing) * (block.size.y + pieceSpacing);
        widest = Math.max(widest, block.size.x);
    }
    const rowWidth = Math.max(widest, Math.sqrt(area));

    const positions = new Map<number, Vector2>();
    let x = 0;
    let y = 0;
    let rowHeight = 0;
    for (const block of blocks) {
        if (x > 0 && x + block.size.x > rowWidth) {
            x = 0;
            y += rowHeight + pieceSpacing;
            rowHeight = 0;
        }
        for (const [node, position] of block.positions) {
            positions.set(node, { x: position.x + x, y: position.y + y });
        }
        x += block.size.x + pieceSpacing;
        rowHeight = Math.max(rowHeight, block.size.y);
    }
    return positions;
}

export function Organize(ctx: CanvasRenderingContext2D, graph: NodeSubsystem, nodesToSort?: Array<number>): void {
    const nodes = graph.getNodes();
    if (nodes.length === 0) {
        return;
    }

    const sorting = new Array<number>();
    if (nodesToSort) {
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
    const sizes = new Map<number, Vector2>();
    for (const index of sorting) {
        sizes.set(index, nodes[index].calculateBounds(ctx, camera).Size);
    }

    const upstream: Edges = new Map();
    for (const index of sorting) {
        const node = nodes[index];
        const feeders = new Array<number>();
        for (let i = 0; i < node.inputs(); i++) {
            for (const connection of node.inputPort(i).connections()) {
                const feeder = connection.outNode();
                const feederIndex = feeder === null ? undefined : nodeLUT.get(feeder);
                if (feederIndex !== undefined && inLayout.has(feederIndex) && feederIndex !== index && !feeders.includes(feederIndex)) {
                    feeders.push(feederIndex);
                }
            }
        }
        upstream.set(index, feeders);
    }
    const downstream = consumersOf(sorting, upstream);

    const positions = layoutGraph(sorting, upstream, downstream, sizes);

    const anchor: Vector2 = { x: 0, y: 0 };
    for (const index of sorting) {
        const position = nodes[index].getPosition();
        anchor.x += position.x;
        anchor.y += position.y;
    }
    anchor.x /= sorting.length;
    anchor.y /= sorting.length;

    let right = 0;
    let bottom = 0;
    for (const [index, position] of positions) {
        right = Math.max(right, position.x + (sizes.get(index) as Vector2).x);
        bottom = Math.max(bottom, position.y + (sizes.get(index) as Vector2).y);
    }

    for (const [index, position] of positions) {
        nodes[index].setPosition({ x: anchor.x - right / 2 + position.x, y: anchor.y - bottom / 2 + position.y });
    }
}
