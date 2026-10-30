import { strict as assert } from 'assert';
import { NodeSubsystem } from '../src/nodes/subsystem';
import { PassSubsystem } from '../src/pass/subsystem';
import { FlowNode } from '../src/node';
import { Camera } from '../src/camera';
import { ContextMenuConfig } from '../src/contextMenu';
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

function hoverOver(graph: NodeSubsystem, node: FlowNode, ctx: CanvasRenderingContext2D, camera: Camera): Vector2 {
    graph.render(ctx, camera, undefined);
    const bounds = node.calculateBounds(ctx, camera);
    const over = { x: bounds.Position.x + bounds.Size.x / 2, y: bounds.Position.y + bounds.Size.y / 2 };
    graph.render(ctx, camera, over);
    return over;
}

function deleteNodeItem(menu: ContextMenuConfig | null) {
    return menu?.subMenus?.find((m) => m.name === 'Delete')?.items?.find((i) => i.name === 'Node');
}

describe('the hovered node going away before the next render', () => {
    it('opens the context menu without it', () => {
        const graph = new NodeSubsystem(new PassSubsystem());
        const node = new FlowNode({ title: 'gone', position: { x: 100, y: 100 } });
        graph.addNode(node);
        const ctx = stubCtx();
        const camera = new Camera();
        const over = hoverOver(graph, node, ctx, camera);

        graph.removeNode(node);

        assert.equal(deleteNodeItem(graph.openContextMenu(ctx, over)), undefined);
    });

    it('keeps pointing at the same node when an earlier one is removed', () => {
        const graph = new NodeSubsystem(new PassSubsystem());
        const earlier = new FlowNode({ title: 'earlier', position: { x: 100, y: 100 } });
        const hovered = new FlowNode({ title: 'hovered', position: { x: 400, y: 100 } });
        graph.addNode(earlier);
        graph.addNode(hovered);
        const ctx = stubCtx();
        const camera = new Camera();
        const over = hoverOver(graph, hovered, ctx, camera);

        graph.removeNode(earlier);
        deleteNodeItem(graph.openContextMenu(ctx, over))?.callback?.();

        assert.deepEqual(graph.getNodes(), []);
    });
});
