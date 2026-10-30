import { strict as assert } from 'assert';
import { FlowNode } from '../src/node';
import { Box } from '../src/types/box';
import { Vector2 } from '../src/types/vector2';
import { WidgetBase, WidgetPointer } from '../src/widgets/widget';
import { center, widgetScene } from './support';

class Recording extends WidgetBase {
    clicks = 0;
    downs: Array<WidgetPointer> = [];
    moves: Array<WidgetPointer> = [];
    ups: Array<WidgetPointer> = [];
    drawnIn: Box | null = null;

    Size(): Vector2 {
        return { x: 100, y: 20 };
    }

    protected render(_ctx: CanvasRenderingContext2D, box: Box): void {
        this.drawnIn = box;
    }

    protected onPointerDown(p: WidgetPointer): void { this.downs.push(p); }
    protected onPointerMove(p: WidgetPointer): void { this.moves.push(p); }
    protected onPointerUp(p: WidgetPointer): void { this.ups.push(p); }
    protected onClick(): void { this.clicks++; }
}

describe('clicking a widget', () => {
    it('clicks it when the press and release are both on it', () => {
        const { widget, widgetBox, click } = widgetScene(() => new Recording());
        click(center(widgetBox()));
        assert.equal((widget as Recording).clicks, 1);
    });

    it('does not click it when the gesture drags away before releasing', () => {
        const { widget, widgetBox, press } = widgetScene(() => new Recording());
        const on = center(widgetBox());

        const gesture = press(on);
        gesture.moveTo({ x: on.x + 400, y: on.y + 300 });
        gesture.release();

        const recording = widget as Recording;
        assert.equal(recording.clicks, 0);
        assert.equal(recording.ups.length, 1, 'it still hears the release');
        assert.equal(recording.ups[0].inside, false);
    });

    it('keeps reporting the drag to the widget once the pointer has left it', () => {
        const { widget, widgetBox, press } = widgetScene(() => new Recording());
        const on = center(widgetBox());

        const gesture = press(on);
        gesture.moveTo({ x: on.x + 300, y: on.y });
        gesture.release();

        const recording = widget as Recording;
        assert.deepEqual(recording.moves.map((m) => m.position), [{ x: on.x + 300, y: on.y }]);
        assert.equal(recording.moves[0].inside, false);
    });

    it('ignores a disabled widget', () => {
        const { widget, widgetBox, click } = widgetScene(() => {
            const w = new Recording();
            w.setDisabled(true);
            return w;
        });
        click(center(widgetBox()));
        const recording = widget as Recording;
        assert.equal(recording.downs.length, 0);
        assert.equal(recording.clicks, 0);
    });
});

describe('laying out widgets', () => {
    it('stretches a widget across a node made wide by its ports', () => {
        const { node, widget } = widgetScene(
            () => new Recording(),
            { inputs: [{ name: 'A port name long enough to widen the whole node', type: 'float64' }] },
        );
        const drawnIn = (widget as Recording).drawnIn as Box;
        assert.ok(drawnIn.Size.x > 100 * 2);
        assert.ok(node.widgets().length === 1);
    });

    it('leaves a hidden widget out of the node and out of reach', () => {
        const shown = widgetScene(() => new Recording());
        const hidden = widgetScene(() => {
            const w = new Recording();
            w.setHidden(true);
            return w;
        });

        const shownHeight = shown.node.calculateBounds(shown.ctx, shown.camera).Size.y;
        const hiddenHeight = hidden.node.calculateBounds(hidden.ctx, hidden.camera).Size.y;
        assert.ok(hiddenHeight < shownHeight);

        hidden.click(center(shown.widgetBox()));
        assert.equal((hidden.widget as Recording).clicks, 0);
    });
});

describe('a node panned off screen', () => {
    it('stops hit-testing as a widget where it used to be drawn', () => {
        const { node, widget, camera, ctx, graph, widgetBox } = widgetScene(
            () => new Recording(),
            { inputs: [{ name: 'In', type: 'float64' }] },
        );
        const on = center(widgetBox());

        camera.position.x = -50000;
        graph.render(ctx, camera, undefined);

        assert.equal(node.inBounds(ctx, camera, on).Widget, undefined);
        graph.clickStart(on, camera, false);
        graph.clickEnd();
        assert.equal((widget as Recording).clicks, 0);
    });
});

describe('a node built from config', () => {
    it('builds a row of labelled numbers bound to properties', () => {
        const node = new FlowNode({
            title: 'vector',
            widgets: [{
                type: 'row',
                config: {
                    widgets: [
                        { type: 'number', config: { property: 'x', label: 'X', width: 60 } },
                        { type: 'number', config: { property: 'y', label: 'Y', width: 60 } },
                    ],
                },
            }],
        });
        node.setProperty('y', 4);
        assert.equal(node.widgets().length, 1);
        assert.equal(node.getProperty('x'), 0);
    });
});
