import { strict as assert } from 'assert';
import { NodeSubsystem } from '../src/nodes/subsystem';
import { PassSubsystem } from '../src/pass/subsystem';
import { FlowNode } from '../src/node';
import { Camera } from '../src/camera';
import { Connection } from '../src/connection';
import { arraySlotCenter } from '../src/port';

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

function scene(sources: number) {
    const graph = new NodeSubsystem(new PassSubsystem());
    const join = new FlowNode({
        title: 'join',
        position: { x: 300, y: 100 },
        inputs: [{ name: 'Items', type: 'mesh', array: true }],
    });
    graph.addNode(join);

    const wires = new Array<Connection>();
    for (let i = 0; i < sources; i++) {
        const source = new FlowNode({
            title: 'source ' + i,
            position: { x: 0, y: 100 + i * 120 },
            outputs: [{ name: 'Out', type: 'mesh' }],
        });
        graph.addNode(source);
        wires.push(graph.connectNodes(source, 0, join, 0) as Connection);
    }

    const camera = new Camera();
    const ctx = stubCtx();
    graph.render(ctx, camera, undefined);
    graph.render(ctx, camera, undefined);

    const slot = (index: number) => arraySlotCenter(join.inputPortPosition(0), sources, index);
    return { graph, join, wires, camera, ctx, slot };
}

describe('an input taking more than one wire', () => {
    it('grows to give each wire its own slot', () => {
        const one = scene(1);
        const three = scene(3);

        assert.ok(three.join.inputPortPosition(0).Size.y > one.join.inputPortPosition(0).Size.y);
        assert.ok(three.slot(0).y < three.slot(1).y && three.slot(1).y < three.slot(2).y);
    });

    it('picks up the wire whose slot was pressed', () => {
        const { graph, join, wires, camera, slot } = scene(3);

        graph.clickStart(slot(1), camera, false);

        const remaining = join.inputPort(0).connections();
        assert.equal(remaining.length, 2);
        assert.ok(remaining.includes(wires[0]));
        assert.ok(!remaining.includes(wires[1]));
        assert.ok(remaining.includes(wires[2]));
    });

    it('puts a dropped wire in the gap under the cursor', () => {
        const { graph, join, wires, camera, ctx } = scene(2);
        const extra = new FlowNode({ title: 'extra', position: { x: 0, y: 500 }, outputs: [{ name: 'Out', type: 'mesh' }] });
        graph.addNode(extra);
        graph.render(ctx, camera, undefined);
        graph.render(ctx, camera, undefined);

        const out = extra.outputPortPosition(0);
        graph.clickStart({ x: out.Position.x + out.Size.x / 2, y: out.Position.y + out.Size.y / 2 }, camera, false);
        const box = join.inputPortPosition(0);
        const between = { x: box.Position.x + box.Size.x / 2, y: box.Position.y + box.Size.y / 2 };
        graph.render(ctx, camera, between);
        graph.render(ctx, camera, between);
        graph.clickEnd();

        const order = join.inputPort(0).connections();
        assert.equal(order.length, 3);
        assert.equal(order[0], wires[0]);
        assert.equal(order[1].outNode(), extra);
        assert.equal(order[2], wires[1]);
    });

    it('moves a wire picked from one slot to the gap it is dropped in', () => {
        const { graph, join, wires, camera, ctx, slot } = scene(3);

        graph.clickStart(slot(2), camera, false);
        graph.render(ctx, camera, slot(2));
        const box = join.inputPortPosition(0);
        const top = { x: box.Position.x + box.Size.x / 2, y: box.Position.y + 1 };
        graph.render(ctx, camera, top);
        graph.render(ctx, camera, top);
        graph.clickEnd();

        assert.deepEqual(join.inputPort(0).connections().map((wire) => wires.indexOf(wire)), [2, 0, 1]);
    });

    it('highlights only the wire whose slot is hovered', () => {
        const { wires, slot } = scene(3);

        assert.equal(wires[0].mouseOverPort(slot(1)), null);
        assert.notEqual(wires[1].mouseOverPort(slot(1)), null);
        assert.equal(wires[2].mouseOverPort(slot(1)), null);
    });
});
