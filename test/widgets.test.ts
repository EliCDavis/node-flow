import { strict as assert } from 'assert';
import { FlowNode } from '../src/node';
import { Box } from '../src/types/box';
import { Vector2 } from '../src/types/vector2';
import { NumberWidget } from '../src/widgets/number';
import { StringWidget } from '../src/widgets/string';
import { SliderWidget } from '../src/widgets/slider';
import { TextWidget } from '../src/widgets/text';
import { ToggleWidget } from '../src/widgets/toggle';
import { ImageWidget } from '../src/widgets/image';
import { ColorWidget } from '../src/widgets/color';
import { RowWidget } from '../src/widgets/row';
import { WidgetBase } from '../src/widgets/widget';
import { placeEditsDuring } from '../src/widgets/inplace';
import { CanvasRecord, center, StubElement, stubCtx, widgetScene, withDocument } from './support';

function cssOf(el: StubElement): Record<string, string> {
    const style: Record<string, string> = {};
    el.style.cssText.split(';').forEach((rule) => {
        const at = rule.indexOf(':');
        if (at > 0) {
            style[rule.slice(0, at).trim()] = rule.slice(at + 1).trim();
        }
    });
    return style;
}

describe('a number widget', () => {
    it('follows a drag and reports one edit when let go', () => {
        const inputs: Array<number> = [];
        const commits: Array<number> = [];
        const edits: Array<number> = [];
        const { node, widget, widgetBox, press } = widgetScene((n) => {
            n.addPropertyEditListener('value', (v) => edits.push(v));
            return new NumberWidget(n, {
                property: 'value', value: 10, step: 0.5,
                onInput: (v) => inputs.push(v),
                callback: (v) => commits.push(v),
            });
        });
        const on = center(widgetBox());

        const gesture = press(on);
        gesture.moveTo({ x: on.x + 10, y: on.y });
        gesture.moveTo({ x: on.x + 20, y: on.y });
        gesture.release();

        assert.deepEqual(inputs, [15, 20]);
        assert.deepEqual(commits, [20]);
        assert.deepEqual(edits, [20]);
        assert.equal(node.getProperty('value'), 20);
        assert.equal((widget as NumberWidget).value(), 20);
    });

    it('keeps on following a drag that leaves the node', () => {
        const { widget, widgetBox, press } = widgetScene((n) => new NumberWidget(n, { value: 0, step: 1 }));
        const on = center(widgetBox());

        const gesture = press(on);
        gesture.moveTo({ x: on.x + 500, y: on.y + 200 });
        gesture.release();

        assert.equal((widget as NumberWidget).value(), 500);
    });

    it('rounds an integer while it is dragged', () => {
        const { widget, widgetBox, press } = widgetScene((n) => new NumberWidget(n, { value: 1, integer: true, step: 0.3 }));
        const on = center(widgetBox());

        const gesture = press(on);
        gesture.moveTo({ x: on.x + 10, y: on.y });
        gesture.release();

        assert.equal((widget as NumberWidget).value(), 4);
    });

    it('opens an input over itself when clicked, and keeps what is typed', () => {
        withDocument((body) => {
            const commits: Array<number> = [];
            const { widget, widgetBox, click } = widgetScene((n) => new NumberWidget(n, { value: 3, callback: (v) => commits.push(v) }));

            click(center(widgetBox()));
            const input = body.children[0];
            assert.ok(input, 'an input was laid over the widget');
            assert.equal(input.value, '3');
            assert.ok(input.focused);

            input.value = '7.5';
            input.fire('keydown', { key: 'Enter' });

            assert.deepEqual(commits, [7.5]);
            assert.equal((widget as NumberWidget).value(), 7.5);
            assert.equal(body.children.length, 0);
        });
    });

    it('throws away what was typed on escape', () => {
        withDocument((body) => {
            const commits: Array<number> = [];
            const { widget, widgetBox, click } = widgetScene((n) => new NumberWidget(n, { value: 3, callback: (v) => commits.push(v) }));

            click(center(widgetBox()));
            const input = body.children[0];
            input.value = '99';
            input.fire('keydown', { key: 'Escape' });

            assert.deepEqual(commits, []);
            assert.equal((widget as NumberWidget).value(), 3);
        });
    });

    it('keeps its input over the widget as the camera moves and zooms', () => {
        withDocument((body) => {
            const { graph, camera, ctx, widgetBox, click } = widgetScene((n) => new NumberWidget(n, { value: 3 }));
            click(center(widgetBox()));
            const input = body.children[0];

            camera.position.x += 137;
            camera.position.y -= 41;
            camera.zoom = 2;
            graph.render(ctx, camera, undefined);

            const box = widgetBox();
            const style = cssOf(input);
            assert.equal(style.left, `${10 + box.Position.x}px`);
            assert.equal(style.top, `${20 + box.Position.y}px`);
            assert.equal(style.width, `${box.Size.x}px`);
            assert.equal(style.height, `${box.Size.y}px`);
        });
    });

    it('hides its input while the node is off the canvas', () => {
        withDocument((body) => {
            const { graph, camera, ctx, widgetBox, click } = widgetScene(
                (n) => new NumberWidget(n, { value: 3 }),
                { inputs: [{ name: 'in', type: 'n' }] },
            );
            click(center(widgetBox()));
            const input = body.children[0];
            const frame =() => placeEditsDuring(ctx.canvas, () => graph.render(ctx, camera, undefined));

            camera.position.x -= 5000;
            frame();
            assert.equal(input.style.opacity, '0');

            camera.position.x += 5000;
            frame();
            assert.equal(input.style.opacity, undefined);
            assert.ok(input.isConnected);
        });
    });

    it('does not open an input after a drag', () => {
        withDocument((body) => {
            const { widgetBox, press } = widgetScene((n) => new NumberWidget(n, { value: 0 }));
            const on = center(widgetBox());
            const gesture = press(on);
            gesture.moveTo({ x: on.x + 10, y: on.y });
            gesture.release();
            assert.equal(body.children.length, 0);
        });
    });

    it('shows a value set from code without reporting it as an edit', () => {
        const commits: Array<number> = [];
        const edits: Array<number> = [];
        const node = new FlowNode({ title: 't' });
        node.addPropertyEditListener('value', (v) => edits.push(v));
        const widget = new NumberWidget(node, { property: 'value', callback: (v) => commits.push(v) });

        widget.setValue(5);
        node.setProperty('value', 6);

        assert.equal(widget.value(), 6);
        assert.deepEqual(commits, []);
        assert.deepEqual(edits, []);
    });

    it('draws its label on the left and its value on the right', () => {
        const record: CanvasRecord = { fills: [], texts: [] };
        const widget = new NumberWidget(new FlowNode({ title: 't' }), { label: 'X', value: 1.5 });
        widget.Draw(stubCtx(record), { Position: { x: 0, y: 0 }, Size: { x: 100, y: 25 } }, 1, undefined);

        const label = record.texts.find((t) => t.text === 'X');
        const value = record.texts.find((t) => t.text === '1.5');
        assert.ok(label && value);
        assert.ok(label.x < value.x);
    });
});

describe('a string widget', () => {
    it('edits in place', () => {
        withDocument((body) => {
            const commits: Array<string> = [];
            const { widgetBox, click } = widgetScene((n) => new StringWidget(n, { value: 'a', callback: (v) => commits.push(v) }));

            click(center(widgetBox()));
            body.children[0].value = 'b';
            body.children[0].fire('blur');

            assert.deepEqual(commits, ['b']);
        });
    });
});

describe('a slider', () => {
    it('stops following the mouse once released away from it', () => {
        const commits: Array<number> = [];
        const { widget, widgetBox, press, graph, ctx, camera } = widgetScene((n) => new SliderWidget(n, {
            value: 0.5,
            callback: (v) => commits.push(v),
        }));
        const on = center(widgetBox());

        const gesture = press(on);
        gesture.moveTo({ x: on.x + 400, y: on.y + 300 });
        gesture.release();

        assert.deepEqual(commits, [1], 'dragging past the end and letting go still finishes the drag');
        graph.render(ctx, camera, { x: 5, y: 500 });
        assert.equal((widget as SliderWidget).value(), 1);
    });
});

describe('a toggle', () => {
    it('flips when clicked and reports the new value', () => {
        const seen: Array<boolean> = [];
        const { widgetBox, click } = widgetScene((n) => new ToggleWidget(n, { callback: (v) => seen.push(v) }));
        click(center(widgetBox()));
        assert.deepEqual(seen, [true]);
    });

    it('stays put when the press is dragged off before release', () => {
        const seen: Array<boolean> = [];
        const { widgetBox, press } = widgetScene((n) => new ToggleWidget(n, { callback: (v) => seen.push(v) }));
        const on = center(widgetBox());
        const gesture = press(on);
        gesture.moveTo({ x: on.x + 300, y: on.y });
        gesture.release();
        assert.deepEqual(seen, []);
    });

    it('lights with the colour configured for its off state', () => {
        const record: CanvasRecord = { fills: [], texts: [] };
        const toggle = new ToggleWidget(new FlowNode({ title: 't' }), { onColor: '#abcdef', offColor: '#123456' });
        toggle.Draw(stubCtx(record), { Position: { x: 0, y: 0 }, Size: { x: 150, y: 25 } }, 1, undefined);
        assert.ok(record.fills.includes('#123456'));
        assert.ok(!record.fills.includes('#abcdef'));
    });
});

describe('a colour widget', () => {
    it('opens the browser picker on click and keeps its alpha', () => {
        withDocument((body) => {
            const inputs: Array<string> = [];
            const commits: Array<string> = [];
            const { widgetBox, click } = widgetScene((n) => new ColorWidget(n, {
                value: '#ff000080',
                onInput: (c) => inputs.push(c),
                callback: (c) => commits.push(c),
            }));

            click(center(widgetBox()));
            const picker = body.children[0];
            assert.equal(picker.clicked, 1);
            assert.equal(picker.value, '#ff0000');

            picker.value = '#00ff00';
            picker.oninput?.();
            picker.onchange?.();

            assert.deepEqual(inputs, ['#00ff0080']);
            assert.deepEqual(commits, ['#00ff0080']);
        });
    });

    it('opens the picker over the widget just clicked, not the one before', () => {
        withDocument((body) => {
            let first: ColorWidget | undefined;
            const { node, widgetBox, click } = widgetScene((n) => {
                first = new ColorWidget(n, { value: '#ff0000' });
                n.addWidget(first);
                return new ColorWidget(n, { value: '#00ff00' });
            });
            const firstBox = node.widgetPosition(node.widgets().indexOf(first as ColorWidget)) as Box;

            click(center(firstBox));
            const picker = body.children[0];
            const overFirst = picker.style.cssText;
            click(center(widgetBox()));
            const overSecond = picker.style.cssText;

            assert.notEqual(overFirst, overSecond);
            assert.deepEqual(picker.openedAt, [overFirst, overSecond]);
        });
    });

    it('writes white on a dark colour that has alpha', () => {
        const record: CanvasRecord = { fills: [], texts: [] };
        const widget = new ColorWidget(new FlowNode({ title: 't' }), { value: '#10101080' });
        widget.Draw(stubCtx(record), { Position: { x: 0, y: 0 }, Size: { x: 150, y: 25 } }, 1, undefined);
        assert.deepEqual(record.texts.map((t) => t.fillStyle), ['white']);
    });
});

class Tap extends WidgetBase {
    clicks = 0;
    width: number;
    constructor(width: number) { super(); this.width = width; }
    Size(): Vector2 { return { x: this.width, y: 20 }; }
    protected render(_ctx: CanvasRenderingContext2D, _box: Box): void { }
    protected onClick(): void { this.clicks++; }
}

describe('a row', () => {
    it('hands the press to the child under it', () => {
        const left = new Tap(40);
        const right = new Tap(40);
        const { widgetBox, click } = widgetScene(() => new RowWidget([left, right]));
        const box = widgetBox();

        click({ x: box.Position.x + box.Size.x - 5, y: box.Position.y + 10 });

        assert.equal(left.clicks, 0);
        assert.equal(right.clicks, 1);
    });

    it('gives the spare room only to children that grow', () => {
        const drawn: Array<Box> = [];
        const spy = (w: number) => new (class extends Tap {
            protected render(_ctx: CanvasRenderingContext2D, box: Box): void { drawn.push(box); }
        })(w);
        const row = new RowWidget([spy(40), spy(20)], { grow: [1, 0], gap: 0 });
        row.Draw(stubCtx(), { Position: { x: 0, y: 0 }, Size: { x: 200, y: 20 } }, 1, undefined);

        assert.equal(drawn[0].Size.x, 180);
        assert.equal(drawn[1].Size.x, 20);
        assert.equal(drawn[1].Position.x, 180);
    });
});

describe('a text widget', () => {
    it('follows the property it is bound to', () => {
        const node = new FlowNode({ title: 't' });
        const text = new TextWidget(node, { property: 'label' });
        node.setProperty('label', 'hi');
        assert.equal(text.text(), 'hi');
    });
});

interface StubImage {
    src: string;
    width: number;
    height: number;
    onload?: () => void;
}

describe('an image widget', () => {
    it('keeps the newest image when an older one finishes loading last', () => {
        const g = globalThis as any;
        const previous = g.document;
        const images: Array<StubImage> = [];
        g.document = {
            createElement: () => {
                const img: StubImage = { src: '', width: 0, height: 0 };
                images.push(img);
                return img;
            },
        };
        try {
            const widget = new ImageWidget();
            widget.SetUrl('old');
            widget.SetUrl('new');
            const [older, newer] = images;
            newer.width = 100; newer.height = 100;
            older.width = 40; older.height = 40;

            newer.onload?.();
            older.onload?.();

            assert.equal(widget.Size().x, 100);
        } finally {
            g.document = previous;
        }
    });
});
