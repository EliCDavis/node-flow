import * as assert from 'assert';
import { assignLayers, findPieces, layoutGraph, orderWithinLayers, topologicalOrder } from '../src/organize';
import { Vector2 } from '../src/types/vector2';

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

describe('layoutGraph', () => {
    type Rect = { x: number, y: number, w: number, h: number };

    function lay(edges: Array<[number, number]>, nodes: Array<number>, heights: Record<number, number> = {}) {
        const { upstream, downstream } = graph(edges, nodes);
        const sizes = new Map<number, Vector2>();
        for (const node of nodes) {
            sizes.set(node, { x: 100, y: heights[node] ?? 40 });
        }
        const positions = layoutGraph(nodes, upstream, downstream, sizes);
        const rect = (node: number): Rect => {
            const p = positions.get(node) as Vector2;
            const s = sizes.get(node) as Vector2;
            return { x: p.x, y: p.y, w: s.x, h: s.y };
        };
        return { positions, rect, centreY: (node: number) => rect(node).y + rect(node).h / 2 };
    }

    function around(rects: Array<Rect>): Rect {
        const x = Math.min(...rects.map((r) => r.x));
        const y = Math.min(...rects.map((r) => r.y));
        return {
            x, y,
            w: Math.max(...rects.map((r) => r.x + r.w)) - x,
            h: Math.max(...rects.map((r) => r.y + r.h)) - y,
        };
    }

    function overlaps(a: Rect, b: Rect): boolean {
        return a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
    }

    it('lays every node out exactly once', () => {
        const nodes = [0, 1, 2, 3, 4, 5, 6];
        const { positions } = lay([[0, 1], [1, 2], [3, 4]], nodes);
        assert.deepStrictEqual([...positions.keys()].sort(), nodes);
    });

    it('keeps separate pieces apart', () => {
        const { rect } = lay([[0, 1], [1, 2], [3, 4], [4, 5]], [0, 1, 2, 3, 4, 5]);
        const first = around([0, 1, 2].map(rect));
        const second = around([3, 4, 5].map(rect));
        assert.ok(!overlaps(first, second), 'the pieces share space');
    });

    it('gathers unconnected nodes away from the pieces', () => {
        const { rect } = lay([[0, 1], [1, 2]], [0, 3, 1, 4, 2, 5]);
        const piece = around([0, 1, 2].map(rect));
        const loose = around([3, 4, 5].map(rect));
        assert.ok(!overlaps(piece, loose), 'a loose node sits inside a piece');
    });

    it('gives every branch of a tree its own band', () => {
        const { rect } = lay([[1, 0], [2, 0], [3, 1], [4, 1], [5, 2], [6, 2]], [0, 1, 2, 3, 4, 5, 6]);
        const first = around([1, 3, 4].map(rect));
        const second = around([2, 5, 6].map(rect));
        assert.ok(first.y + first.h <= second.y || second.y + second.h <= first.y, 'the branches interleave');
    });

    it('lines a tree node up with the single input feeding it', () => {
        const { centreY } = lay([[0, 1], [1, 2]], [0, 1, 2], { 0: 40, 1: 120, 2: 60 });
        assert.strictEqual(centreY(0), centreY(1));
        assert.strictEqual(centreY(1), centreY(2));
    });

    it('puts an input in the column right before what it feeds', () => {
        const edges: Array<[number, number]> = [[0, 1], [1, 2], [2, 3], [0, 3], [4, 3]];
        const { rect } = lay(edges, [0, 1, 2, 3, 4]);
        assert.strictEqual(rect(4).x, rect(2).x);
    });

    it('lines a node up with the one thing it feeds', () => {
        const edges: Array<[number, number]> = [[0, 1], [0, 2], [1, 3], [2, 3], [3, 4]];
        const { centreY } = lay(edges, [0, 1, 2, 3, 4], { 3: 90 });
        assert.strictEqual(centreY(3), centreY(4));
    });

    it('keeps the nodes a long wire passes clear of its path', () => {
        const edges: Array<[number, number]> = [[0, 1], [1, 2], [2, 3], [0, 3]];
        const { rect, centreY } = lay(edges, [0, 1, 2, 3]);
        const wire = (centreY(0) + centreY(3)) / 2;
        for (const node of [1, 2]) {
            const r = rect(node);
            assert.ok(wire < r.y || wire > r.y + r.h, `the wire runs through node ${node}`);
        }
    });

    it('never overlaps two nodes', () => {
        const edges: Array<[number, number]> = [
            [0, 3], [1, 3], [2, 4], [3, 5], [4, 5], [0, 6], [6, 7], [5, 7], [1, 8], [8, 9], [2, 9], [7, 10], [9, 10], [0, 10],
        ];
        const nodes = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
        const heights = { 0: 80, 3: 150, 5: 30, 7: 200, 9: 60, 11: 90 };
        const { rect } = lay(edges, nodes, heights);
        for (let a = 0; a < nodes.length; a++) {
            for (let b = a + 1; b < nodes.length; b++) {
                assert.ok(!overlaps(rect(nodes[a]), rect(nodes[b])), `${nodes[a]} overlaps ${nodes[b]}`);
            }
        }
    });

    it('lays out a cycle without hanging', () => {
        const { positions } = lay([[0, 1], [1, 2], [2, 0], [2, 3]], [0, 1, 2, 3]);
        assert.strictEqual(positions.size, 4);
    });
});

describe('findPieces', () => {
    it('splits nodes into the groups wires join', () => {
        const { upstream, downstream } = graph([[0, 1], [2, 1], [3, 4]], [0, 1, 2, 3, 4, 5]);
        const pieces = findPieces([0, 1, 2, 3, 4, 5], upstream, downstream);
        assert.deepStrictEqual(pieces, [[0, 1, 2], [3, 4], [5]]);
    });
});
