import { strict as assert } from 'assert';
import { NodeSubsystem } from '../src/nodes/subsystem';
import { PassSubsystem } from '../src/pass/subsystem';
import { FlowNode, NodeIntersection } from '../src/node';
import { Camera } from '../src/camera';
import { stubCtx } from './support';

function scene(inputs: Array<{ name: string, type: string, hidden?: boolean }>) {
    const graph = new NodeSubsystem(new PassSubsystem());
    const node = new FlowNode({
        title: 'material',
        position: { x: 100, y: 100 },
        inputs,
        outputs: [{ name: 'Out', type: 'material' }],
    });
    graph.addNode(node);
    return { graph, node, camera: new Camera(), ctx: stubCtx() };
}

const material = [
    { name: 'Color', type: 'color' },
    { name: 'Sheen', type: 'sheen', hidden: true },
    { name: 'Clearcoat', type: 'clearcoat', hidden: true },
];

function findWidget(s: ReturnType<typeof scene>): NodeIntersection | undefined {
    s.graph.render(s.ctx, s.camera, undefined);
    const bounds = s.node.calculateBounds(s.ctx, s.camera);
    for (let y = bounds.Position.y; y < bounds.Position.y + bounds.Size.y; y++) {
        const hit = s.node.inBounds(s.ctx, s.camera, { x: bounds.Position.x + bounds.Size.x / 2, y });
        if (hit.Widget !== undefined) {
            return hit;
        }
    }
    return undefined;
}

function click(hit: NodeIntersection) {
    const pointer = { position: { x: 0, y: 0 }, inside: true } as any;
    hit.Widget!.PointerDown!(pointer);
    hit.Widget!.PointerUp!(pointer);
}

describe('a node with hidden ports', () => {
    it('draws a row that shows them', () => {
        const s = scene(material);
        const toggle = findWidget(s);
        assert.ok(toggle, 'no toggle row to click');

        click(toggle);

        assert.equal(s.node.inputPort(1).hidden(), false);
        assert.equal(s.node.inputPort(2).hidden(), false);
    });

    it('hides them again on a second click', () => {
        const s = scene(material);
        click(findWidget(s)!);
        click(findWidget(s)!);

        assert.equal(s.node.inputPort(1).hidden(), true);
        assert.equal(s.node.inputPort(2).hidden(), true);
    });

    it('grows when they are shown', () => {
        const s = scene(material);
        const collapsed = s.node.calculateBounds(s.ctx, s.camera).Size.y;

        s.node.setHiddenPortsShown(true);

        assert.ok(s.node.calculateBounds(s.ctx, s.camera).Size.y > collapsed);
    });

    it('asks for a fresh layout when they are shown', () => {
        const s = scene(material);
        s.graph.render(s.ctx, s.camera, undefined);

        s.node.setHiddenPortsShown(true);

        assert.ok(!s.node.hasBeenLaidOut());
    });

    it('does not take the place of its own widgets', () => {
        const s = scene(material);
        assert.equal(s.node.widgetCount(), 0);
        assert.equal(findWidget(s)!.WidgetIndex, undefined);
    });

    it('has no row when nothing is hidden', () => {
        assert.equal(findWidget(scene([{ name: 'Color', type: 'color' }])), undefined);
    });

    it('has no row once every hidden port is wired', () => {
        const s = scene([{ name: 'Color', type: 'color' }, { name: 'Sheen', type: 'sheen', hidden: true }]);
        const source = new FlowNode({ title: 'sheen', outputs: [{ name: 'Out', type: 'sheen' }] });
        s.graph.addNode(source);

        s.graph.connectNodes(source, 0, s.node, 1);

        assert.equal(findWidget(s), undefined);
    });
});
