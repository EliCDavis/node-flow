import { strict as assert } from 'assert';
import { NodeSubsystem } from '../src/nodes/subsystem';
import { PassSubsystem } from '../src/pass/subsystem';
import { FlowNode } from '../src/node';
import { Camera } from '../src/camera';
import { Box } from '../src/types/box';
import { Vector2 } from '../src/types/vector2';

function stubCtx(): CanvasRenderingContext2D {
    const ctx: any = {
        canvas: { width: 800, height: 600 },
        lineWidth: 1,
        font: '',
        textAlign: 'left',
        textBaseline: 'top',
        fillStyle: '',
        strokeStyle: '',
        globalAlpha: 1,
        measureText: () => ({ width: 40 }),
        save: () => { }, restore: () => { }, translate: () => { }, scale: () => { },
        beginPath: () => { }, closePath: () => { }, roundRect: () => { }, rect: () => { },
        moveTo: () => { }, lineTo: () => { }, arc: () => { }, ellipse: () => { },
        bezierCurveTo: () => { }, quadraticCurveTo: () => { },
        fill: () => { }, stroke: () => { }, fillText: () => { }, strokeText: () => { },
        clip: () => { }, drawImage: () => { }, setLineDash: () => { },
        createLinearGradient: () => ({ addColorStop: () => { } }),
    };
    return ctx as CanvasRenderingContext2D;
}

function recordingWidget() {
    let clicks = 0;
    let drawnAt: Box | null = null;
    const widget = {
        Size: (): Vector2 => ({ x: 100, y: 20 }),
        Draw: (_ctx: CanvasRenderingContext2D, position: Vector2, scale: number): Box => {
            drawnAt = { Position: { x: position.x, y: position.y }, Size: { x: 100 * scale, y: 20 * scale } };
            return drawnAt;
        },
        ClickStart: (): void => { },
        ClickEnd: (): void => { clicks++; },
    };
    return {
        widget,
        clicks: () => clicks,
        center: (): Vector2 => {
            assert.ok(drawnAt !== null, 'widget was never drawn');
            const b = drawnAt as Box;
            return { x: b.Position.x + b.Size.x / 2, y: b.Position.y + b.Size.y / 2 };
        },
    };
}

function scene() {
    const graph = new NodeSubsystem(new PassSubsystem());
    const node = new FlowNode({ title: 'test', position: { x: 100, y: 100 } });
    const rec = recordingWidget();
    node.addWidget(rec.widget as any);
    graph.addNode(node);

    const camera = new Camera();
    const ctx = stubCtx();
    return { graph, camera, ctx, rec };
}

describe('clicking a widget', () => {
    it('opens it when the press and release are both on it', () => {
        const { graph, camera, ctx, rec } = scene();
        graph.render(ctx, camera, undefined);
        const on = rec.center();

        graph.render(ctx, camera, on);
        graph.clickStart(on, camera, false);
        graph.render(ctx, camera, on);
        graph.clickEnd();

        assert.equal(rec.clicks(), 1);
    });

    it('leaves it alone when the gesture drags away before releasing', () => {
        const { graph, camera, ctx, rec } = scene();
        graph.render(ctx, camera, undefined);
        const on = rec.center();

        graph.render(ctx, camera, on);
        graph.clickStart(on, camera, false);
        graph.render(ctx, camera, { x: on.x + 400, y: on.y + 300 });
        graph.clickEnd();

        assert.equal(rec.clicks(), 0);
    });
});

describe('a node panned off screen', () => {
    it('stops hit-testing as a widget where it used to be drawn', () => {
        const graph = new NodeSubsystem(new PassSubsystem());
        const node = new FlowNode({
            title: 'test',
            position: { x: 100, y: 100 },
            inputs: [{ name: 'In', type: 'float64' }],
        });
        const rec = recordingWidget();
        node.addWidget(rec.widget as any);
        graph.addNode(node);

        const camera = new Camera();
        const ctx = stubCtx();

        graph.render(ctx, camera, undefined);
        const on = rec.center();

        camera.position.x = -50000;
        graph.render(ctx, camera, undefined);

        assert.equal(
            node.inBounds(ctx, camera, on).Widget,
            undefined,
            'a node that was not drawn has no widget under any screen point',
        );

        graph.clickStart(on, camera, false);
        graph.clickEnd();

        assert.equal(rec.clicks(), 0);
    });
});
