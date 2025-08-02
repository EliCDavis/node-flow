import { Camera } from "./camera";
import { NodeFlowGraph } from "./graph";
import { FlowNode } from "./node";
import { NodeSubsystem } from "./nodes/subsystem";
import { Box } from "./types/box";

// TODO: Cyclical dependencies will end our life

function MarkInputs(graph: NodeSubsystem, positions: Array<number>, nodeLUT: Map<FlowNode, number>, node: number, depth: number, shouldSort: Map<FlowNode, boolean>) {
    const inputs = graph.connectedInputsNodeReferencesByIndex(node);
    for (let i = 0; i < inputs.length; i++) {
        const nodeIndex = nodeLUT.get(inputs[i]) as number;

        if (!shouldSort.has(inputs[i])) {
            continue;
        }

        positions[nodeIndex] = depth;
        MarkInputs(graph, positions, nodeLUT, nodeIndex, depth - 1, shouldSort);
    }
}

function MarkOutputs(graph: NodeSubsystem, positions: Array<number>, nodeLUT: Map<FlowNode, number>, node: number, depth: number, shouldSort: Map<FlowNode, boolean>) {
    const outputs = graph.connectedInputsNodeReferencesByIndex(node);
    for (let i = 0; i < outputs.length; i++) {
        const nodeIndex = nodeLUT.get(outputs[i]) as number;

        if (!shouldSort.has(outputs[i])) {
            continue;
        }

        positions[nodeIndex] = depth;
        MarkOutputs(graph, positions, nodeLUT, nodeIndex, depth + 1, shouldSort);
    }
}

export function Organize(ctx: CanvasRenderingContext2D, graph: NodeSubsystem, nodesToSort?: Array<number>): void {
    const nodes = graph.getNodes();
    const nodeLUT = new Map<FlowNode, number>();
    const bounds = new Array<Box>(nodes.length);
    const relativePosition = new Array<Array<number>>(nodes.length);
    const claimed = new Array<boolean>(nodes.length);
    const shouldSort = new Map<FlowNode, boolean>(); // TODO: we don't really need a Map, is their a Set data structure?

    if (nodesToSort) {
        if (nodesToSort.length < 2) {
            return;
        }
        for (let i = 0; i < nodesToSort.length; i++) {
            shouldSort.set(nodes[nodesToSort[i]], true);
        }
    } else {
        for (let i = 0; i < nodes.length; i++) {
            shouldSort.set(nodes[i], true);
        }
    }

    const camera = new Camera();

    // Initialize everything
    for (let i = 0; i < nodes.length; i++) {
        bounds[i] = nodes[i].calculateBounds(ctx, camera);
        relativePosition[i] = new Array<number>(nodes.length);
        nodeLUT.set(nodes[i], i);
        claimed[i] = false;
    }

    for (let i = 0; i < nodes.length; i++) {
        relativePosition[i][i] = 0;
        MarkInputs(graph, relativePosition[i], nodeLUT, i, -1, shouldSort);
        MarkOutputs(graph, relativePosition[i], nodeLUT, i, 1, shouldSort);
    }

    interface entry {
        node: number;
        length: number;
        min: number;
        max: number
    }

    let entries = new Array<entry>(shouldSort.size);

    let nodeIndex = 0;
    for (let i = 0; i < nodes.length; i++) {
        if (!shouldSort.has(nodes[i])) {
            continue;
        }

        let min = 0;
        let max = 0;
        for (let x = 0; x < nodes.length; x++) {
            const val = relativePosition[i][x];
            if (val === undefined) {
                continue;
            }

            min = Math.min(min, val);
            max = Math.max(max, val);
        }
        entries[nodeIndex] = {
            length: max - min,
            node: i,
            min: min,
            max: max
        }
        nodeIndex++
    }


    entries.sort((a, b) => b.length - a.length);

    interface Column {
        Nodes: Array<FlowNode>;
        Width: number;
    }

    const columns = Array<Column>(entries[0].length + 1);
    for (let i = 0; i < columns.length; i++) {
        columns[i] = {
            Nodes: new Array<FlowNode>(),
            Width: 0
        };
    }

    for (let i = 0; i < entries.length; i++) {
        const entry = entries[i];
        if (claimed[entry.node] === true) {
            continue;
        }

        const positions = relativePosition[entry.node];

        for (let p = 0; p < positions.length; p++) {
            const position = positions[p];
            if (position === undefined) {
                continue;
            }

            if (claimed[p] === true) {
                continue;
            }

            const nodeBounds = bounds[p];
            const column = columns[position - entry.min];
            column.Nodes.push(nodes[p])
            column.Width = Math.max(column.Width, nodeBounds.Size.x)

            claimed[p] = true;
        }
    }

    let allColumnsWidths = 0;
    for (let c = 0; c < columns.length; c++) {
        allColumnsWidths += columns[c].Width;
    }

    const widthSpacing = 100;
    const heightSpacing = 50;

    let widthOffset = 0;
    for (let c = 0; c < columns.length; c++) {
        var column = columns[c];
        let heightOffset = 0;

        widthOffset -= widthSpacing + column.Width;

        for (let n = 0; n < column.Nodes.length; n++) {
            const node = column.Nodes[n];
            const nodeBounds = bounds[nodeLUT.get(node) as number];

            let pos = {
                x: widthOffset + allColumnsWidths + (columns.length * widthSpacing),
                y: heightOffset
            }

            heightOffset += nodeBounds.Size.y + heightSpacing
            node.setPosition(pos);
        }
    }

}