import { strict as assert } from 'assert';
import { NodeSubsystem } from '../src/nodes/subsystem';
import { PassSubsystem } from '../src/pass/subsystem';
import { FlowNode } from '../src/node';
import { FlowNote } from '../src/notes/note';
import { Camera } from '../src/camera';
import { NumberWidget } from '../src/widgets/number';
import { DefaultTheme, Theme, onThemeChange, setTheme, themeVersion } from '../src/theme';
import { CanvasRecord, stubCtx } from './support';

function drawNode(node: FlowNode): CanvasRecord {
    const record: CanvasRecord = { fills: [], texts: [] };
    const graph = new NodeSubsystem(new PassSubsystem());
    graph.addNode(node);
    graph.render(stubCtx(record), new Camera(), undefined);
    return record;
}

describe('the theme', () => {
    afterEach(() => setTheme());

    it('lays a partial theme over the defaults', () => {
        setTheme({ Node: { BackgroundColor: '#c0c0c0' } });

        assert.equal(Theme.Node.BackgroundColor, '#c0c0c0');
        assert.equal(Theme.Node.Title.Color, DefaultTheme.Node.Title.Color);
    });

    it('goes back to the defaults when set to nothing', () => {
        setTheme({ Graph: { BackgroundColor: '#008080' } });
        setTheme();
        assert.equal(Theme.Graph.BackgroundColor, DefaultTheme.Graph.BackgroundColor);
    });

    it('tells listeners and moves the version on', () => {
        let heard = 0;
        const stop = onThemeChange(() => heard++);
        const before = themeVersion();

        setTheme({ FontFamily: 'Tahoma' });
        stop();
        setTheme();

        assert.equal(heard, 1);
        assert.ok(themeVersion() > before);
    });

    it('recolours a node that was made before the change', () => {
        const node = new FlowNode({ title: 'made earlier' });
        assert.ok(drawNode(node).fills.includes(DefaultTheme.Node.BackgroundColor));

        setTheme({ Node: { BackgroundColor: '#c0c0c0', Title: { Color: '#000080' } } });
        const after = drawNode(node);

        assert.ok(after.fills.includes('#c0c0c0'));
        assert.ok(after.fills.includes('#000080'));
        assert.ok(!after.fills.includes(DefaultTheme.Node.BackgroundColor));
    });

    it('keeps a colour a node was given over the theme', () => {
        const node = new FlowNode({ title: 'styled', style: { idle: { color: '#123456' } } });
        setTheme({ Node: { BackgroundColor: '#c0c0c0' } });
        assert.ok(drawNode(node).fills.includes('#123456'));
    });

    it('redraws widgets in the new colours', () => {
        const record: CanvasRecord = { fills: [], texts: [] };
        const widget = new NumberWidget(new FlowNode({ title: 't' }), { value: 1 });
        setTheme({ Widget: { Input: { BackgroundColor: '#ffffff', FontColor: '#000000' } } });

        widget.Draw(stubCtx(record), { Position: { x: 0, y: 0 }, Size: { x: 100, y: 25 } }, 1, undefined);

        assert.ok(record.fills.includes('#ffffff'));
        assert.deepEqual(record.texts.map((t) => t.fillStyle), ['#000000']);
    });

    it('re-reads a note in the new colours', () => {
        const record: CanvasRecord = { fills: [], texts: [] };
        const note = new FlowNote({ text: 'hello', position: { x: 0, y: 0 } });
        setTheme({ Note: { FontColor: '#ffffff' } });

        note.render(stubCtx(record), new Camera(), undefined);

        assert.ok(record.texts.some((t) => t.text === 'hello' && t.fillStyle === '#ffffff'));
    });
});
