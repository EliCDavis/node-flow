import { strict as assert } from 'assert';
import { NodeSubsystem } from '../src/nodes/subsystem';
import { PassSubsystem } from '../src/pass/subsystem';
import { FlowNode } from '../src/node';
import { Camera } from '../src/camera';
import { Vector2 } from '../src/types/vector2';
import { center, stubCtx } from './support';

function scene() {
    let drawnTo: Vector2 | null = null;
    const graph = new NodeSubsystem(new PassSubsystem(), {
        idleConnection: {
            renderer: (params) => { drawnTo = { x: params.start.x, y: params.start.y }; },
        },
    });
    const from = new FlowNode({ title: 'from', position: { x: 50, y: 50 }, outputs: [{ name: 'out', type: 'n' }] });
    const to = new FlowNode({ title: 'to', position: { x: 300, y: 80 }, inputs: [{ name: 'in', type: 'n' }] });
    graph.addNode(from);
    graph.addNode(to);
    graph.connectNodes(from, 0, to, 0);

    const camera = new Camera();
    const ctx = stubCtx();
    graph.render(ctx, camera, undefined);
    graph.render(ctx, camera, undefined);
    return { graph, to, camera, ctx, drawnTo: () => drawnTo as Vector2 | null };
}

describe('a wire', () => {
    it('meets its port in the first frame after the camera moves', () => {
        const { graph, to, camera, ctx, drawnTo } = scene();

        camera.position.x += 137;
        camera.position.y -= 41;
        graph.render(ctx, camera, undefined);

        assert.deepEqual(drawnTo(), center(to.inputPortPosition(0)));
    });

    it('meets its port in the first frame after the camera zooms', () => {
        const { graph, to, camera, ctx, drawnTo } = scene();

        camera.zoom = 1.7;
        graph.render(ctx, camera, undefined);

        assert.deepEqual(drawnTo(), center(to.inputPortPosition(0)));
    });

    it('meets its port in the first frame after the node is dragged', () => {
        const { graph, to, camera, ctx, drawnTo } = scene();

        to.translate({ x: 60, y: 25 });
        graph.render(ctx, camera, undefined);

        assert.deepEqual(drawnTo(), center(to.inputPortPosition(0)));
    });
});
