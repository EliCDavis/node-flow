import { strict as assert } from 'assert';
import { NodeSubsystem } from '../src/nodes/subsystem';
import { PassSubsystem } from '../src/pass/subsystem';
import { FlowNode } from '../src/node';
import { Camera } from '../src/camera';
import { Theme } from '../src/theme';
import { center, stubCtx } from './support';

describe('the node hover listener', () => {
    it('reports the node under the mouse once, then null when the mouse leaves', () => {
        const graph = new NodeSubsystem(new PassSubsystem());
        const node = new FlowNode({ title: 'hovered', position: { x: 100, y: 100 } });
        graph.addNode(node);
        const ctx = stubCtx();
        const camera = new Camera();
        const seen: Array<FlowNode | null> = [];
        graph.addNodeHoverListener((n) => seen.push(n));

        graph.render(ctx, camera, undefined);
        const over = center(node.calculateBounds(ctx, camera));
        graph.render(ctx, camera, over);
        graph.render(ctx, camera, over);
        graph.render(ctx, camera, undefined);

        assert.deepEqual(seen, [node, null]);
    });
});

describe('a highlighted node', () => {
    it('keeps a screen-width outline in the highlight colour when zoomed far out', () => {
        const node = new FlowNode({ title: 'lit', position: { x: 100, y: 100 } });
        const graph = new NodeSubsystem(new PassSubsystem());
        graph.addNode(node);
        const strokes: Array<{ style: string; width: number }> = [];
        const ctx = stubCtx();
        (ctx as any).stroke = function () { strokes.push({ style: this.strokeStyle, width: this.lineWidth }); };
        const camera = new Camera();
        camera.zoom = 0.1;

        node.setHighlighted(true);
        graph.render(ctx, camera, undefined);

        assert.ok(strokes.some((s) => s.style === Theme.Node.Border.Highlighted && s.width === 2));
    });

    it('draws its ports with the same line width as when it is not highlighted', () => {
        const widths = (highlighted: boolean) => {
            const node = new FlowNode({ title: 'lit', position: { x: 100, y: 100 }, inputs: [{ name: 'In', type: 'float64' }] });
            const graph = new NodeSubsystem(new PassSubsystem());
            graph.addNode(node);
            const strokes: Array<{ style: string; width: number }> = [];
            const ctx = stubCtx();
            let width = 1;
            Object.defineProperty(ctx, 'lineWidth', { get: () => width, set: (w: number) => { width = w; } });
            const saved: Array<number> = [];
            (ctx as any).save = () => saved.push(width);
            (ctx as any).restore = () => { width = saved.pop() ?? width; };
            (ctx as any).stroke = function () { strokes.push({ style: this.strokeStyle, width }); };
            const camera = new Camera();
            camera.zoom = 0.1;

            node.setHighlighted(highlighted);
            graph.render(ctx, camera, undefined);
            return strokes.filter((s) => s.style !== Theme.Node.Border.Highlighted).map((s) => s.width);
        };

        assert.deepEqual(widths(true), widths(false));
    });
});
