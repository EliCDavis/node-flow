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
        measureText: () => ({ width: 40, actualBoundingBoxAscent: 8, actualBoundingBoxDescent: 2 }),
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

function center(box: Box): Vector2 {
    return { x: box.Position.x + box.Size.x / 2, y: box.Position.y + box.Size.y / 2 };
}

function scene(hidden: boolean) {
    const graph = new NodeSubsystem(new PassSubsystem());
    const node = new FlowNode({
        title: 'material',
        position: { x: 100, y: 100 },
        inputs: [
            { name: 'Color', type: 'color' },
            { name: 'Sheen', type: 'sheen', hidden },
            { name: 'Roughness', type: 'float64' },
        ],
        outputs: [{ name: 'Out', type: 'material' }],
    });
    graph.addNode(node);
    return { graph, node, camera: new Camera(), ctx: stubCtx() };
}

describe('a hidden port', () => {
    it('takes no room on its node', () => {
        const shown = scene(false);
        const hidden = scene(true);

        const shownHeight = shown.node.calculateBounds(shown.ctx, shown.camera).Size.y;
        const hiddenHeight = hidden.node.calculateBounds(hidden.ctx, hidden.camera).Size.y;

        assert.ok(hiddenHeight < shownHeight);
    });

    it('cannot be hovered where it would have been drawn', () => {
        const { graph, node, camera, ctx } = scene(false);
        graph.render(ctx, camera, undefined);
        const where = center(node.inputPortPosition(1));

        node.inputPort(1).setHidden(true);
        graph.render(ctx, camera, undefined);

        assert.notEqual(node.inBounds(ctx, camera, where).Port, node.inputPort(1));
    });

    it('keeps the ports after it lined up with their indices', () => {
        const { graph, node, camera, ctx } = scene(true);
        graph.render(ctx, camera, undefined);

        const roughness = center(node.inputPortPosition(2));
        assert.equal(node.inBounds(ctx, camera, roughness).Port, node.inputPort(2));
    });

    it('asks for a fresh layout when it is shown or hidden', () => {
        const { graph, node, camera, ctx } = scene(true);
        graph.render(ctx, camera, undefined);
        assert.ok(node.hasBeenLaidOut());

        node.inputPort(1).setHidden(false);

        assert.ok(!node.hasBeenLaidOut());
    });

    it('asks for a fresh layout when a wire makes it show', () => {
        const { graph, node, camera, ctx } = scene(true);
        const source = new FlowNode({ title: 'sheen', outputs: [{ name: 'Out', type: 'sheen' }] });
        graph.addNode(source);
        graph.render(ctx, camera, undefined);

        graph.connectNodes(source, 0, node, 1);

        assert.ok(!node.hasBeenLaidOut());
    });

    it('moves the ports below it for a node drawn off screen', () => {
        const { graph, node, camera, ctx } = scene(true);
        const offset = () => node.inputPortPosition(2).Position.y - node.calculateBounds(ctx, camera).Position.y;
        graph.render(ctx, camera, undefined);
        const before = offset();

        camera.position.x = -50000;
        graph.render(ctx, camera, undefined);
        node.inputPort(1).setHidden(false);
        graph.render(ctx, camera, undefined);

        assert.ok(offset() > before);
    });

    it('shows while something is connected to it', () => {
        const { graph, node } = scene(true);
        const source = new FlowNode({ title: 'sheen', outputs: [{ name: 'Out', type: 'sheen' }] });
        graph.addNode(source);

        graph.connectNodes(source, 0, node, 1);

        assert.equal(node.inputPort(1).hidden(), false);
    });
});
