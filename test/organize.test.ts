import * as assert from 'assert';
import { assignLayers, orderWithinLayers, topologicalOrder } from '../src/organize';

/** Builds the upstream/downstream maps Organize works from. */
function graph(edges: Array<[number, number]>, nodes: Array<number>) {
    const upstream = new Map<number, Array<number>>();
    const downstream = new Map<number, Array<number>>();
    for (const node of nodes) {
        upstream.set(node, []);
        downstream.set(node, []);
    }
    for (const [from, to] of edges) {
        (upstream.get(to) as Array<number>).push(from);
        (downstream.get(from) as Array<number>).push(to);
    }
    return { upstream, downstream, nodes };
}

describe('assignLayers', () => {
    it('puts a chain in one node per layer, in order', () => {
        const { upstream } = graph([[0, 1], [1, 2], [2, 3]], [0, 1, 2, 3]);
        const layout = assignLayers([0, 1, 2, 3], upstream);

        assert.deepStrictEqual(layout.layers, [[0], [1], [2], [3]]);
    });

    it('puts a node to the right of the furthest thing feeding it, not the nearest', () => {
        // 0 feeds both 1 and a longer path 2 -> 3, and 4 consumes 1 and 3.
        // Taking the nearest feeder would put 4 beside 3 instead of after it.
        const { upstream } = graph([[0, 1], [0, 2], [2, 3], [1, 4], [3, 4]], [0, 1, 2, 3, 4]);
        const layout = assignLayers([0, 1, 2, 3, 4], upstream);

        assert.strictEqual(layout.layerOf.get(0), 0);
        assert.strictEqual(layout.layerOf.get(3), 2);
        assert.strictEqual(layout.layerOf.get(4), 3, 'the join waits for the long branch');
    });

    it('never puts a node left of something it consumes', () => {
        const edges: Array<[number, number]> = [[0, 2], [1, 2], [2, 3], [1, 3], [3, 4], [0, 4]];
        const { upstream } = graph(edges, [0, 1, 2, 3, 4]);
        const layout = assignLayers([0, 1, 2, 3, 4], upstream);

        for (const [from, to] of edges) {
            assert.ok(
                (layout.layerOf.get(from) as number) < (layout.layerOf.get(to) as number),
                `${from} -> ${to} points backwards`,
            );
        }
    });

    it('terminates on a cycle instead of hanging', () => {
        const { upstream } = graph([[0, 1], [1, 2], [2, 0], [2, 3]], [0, 1, 2, 3]);
        const layout = assignLayers([0, 1, 2, 3], upstream);

        assert.strictEqual(layout.layerOf.size, 4);
        // The cycle is spread across layers rather than collapsed into one.
        assert.ok(layout.layers.length > 1);
    });

    it('starts every disconnected node at the first layer', () => {
        const { upstream } = graph([], [0, 1, 2]);
        const layout = assignLayers([0, 1, 2], upstream);

        assert.deepStrictEqual(layout.layers.length, 1);
        assert.deepStrictEqual(layout.layers[0].sort(), [0, 1, 2]);
    });

    it('handles a graph deep enough to overflow a recursive walk', () => {
        const edges: Array<[number, number]> = [];
        const nodes: Array<number> = [];
        for (let i = 0; i < 20000; i++) {
            nodes.push(i);
            if (i > 0) {
                edges.push([i - 1, i]);
            }
        }
        const { upstream } = graph(edges, nodes);
        const layout = assignLayers(nodes, upstream);

        assert.strictEqual(layout.layers.length, 20000);
    });
});

describe('orderWithinLayers', () => {
    /** Counts pairs of edges between two layers that cross each other. */
    function crossings(layout: ReturnType<typeof assignLayers>, edges: Array<[number, number]>): number {
        const slot = new Map<number, number>();
        for (const layer of layout.layers) {
            layer.forEach((node, index) => slot.set(node, index));
        }

        let total = 0;
        for (let i = 0; i < edges.length; i++) {
            for (let j = i + 1; j < edges.length; j++) {
                const [a1, a2] = edges[i];
                const [b1, b2] = edges[j];
                if (layout.layerOf.get(a1) !== layout.layerOf.get(b1)) {
                    continue;
                }
                if (layout.layerOf.get(a2) !== layout.layerOf.get(b2)) {
                    continue;
                }
                const left = (slot.get(a1) as number) - (slot.get(b1) as number);
                const right = (slot.get(a2) as number) - (slot.get(b2) as number);
                if (left * right < 0) {
                    total++;
                }
            }
        }
        return total;
    }

    it('untangles edges that start out crossed', () => {
        // Three sources feeding three sinks in reverse order: laid out in
        // declaration order every edge crosses every other.
        const edges: Array<[number, number]> = [[0, 5], [1, 4], [2, 3]];
        const nodes = [0, 1, 2, 3, 4, 5];
        const { upstream, downstream } = graph(edges, nodes);

        const layout = assignLayers(nodes, upstream);
        const before = crossings(layout, edges);
        orderWithinLayers(layout, upstream, downstream);
        const after = crossings(layout, edges);

        assert.ok(before > 0, 'the fixture should start tangled');
        assert.strictEqual(after, 0, `expected no crossings, got ${after}`);
    });

    it('keeps every node exactly once', () => {
        const nodes = [0, 1, 2, 3, 4, 5];
        const { upstream, downstream } = graph([[0, 3], [1, 3], [2, 4], [3, 5], [4, 5]], nodes);

        const layout = assignLayers(nodes, upstream);
        orderWithinLayers(layout, upstream, downstream);

        const seen = layout.layers.flat().sort((a, b) => a - b);
        assert.deepStrictEqual(seen, nodes);
    });
});

describe('topologicalOrder', () => {
    it('lists every node once', () => {
        const { upstream } = graph([[0, 1], [1, 2], [0, 2]], [0, 1, 2]);
        const order = topologicalOrder([0, 1, 2], upstream);

        assert.deepStrictEqual(order.slice().sort(), [0, 1, 2]);
    });

    it('puts feeders before the nodes that consume them', () => {
        const { upstream } = graph([[0, 1], [1, 2]], [0, 1, 2]);
        const order = topologicalOrder([0, 1, 2], upstream);

        assert.ok(order.indexOf(0) < order.indexOf(1));
        assert.ok(order.indexOf(1) < order.indexOf(2));
    });
});
