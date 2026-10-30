import { strict as assert } from 'assert';
import { BuildMarkdown } from '../src/markdown/markdown';
import { CodeBlockEntry } from '../src/markdown/entry';
import { Theme } from '../src/theme';

interface Drawn {
    box: { y: number; height: number } | null;
    lines: Array<{ text: string; y: number; baseline: string }>;
}

function recordingCtx(drawn: Drawn): CanvasRenderingContext2D {
    const ctx: any = {
        font: '',
        fillStyle: '',
        textAlign: 'left',
        textBaseline: 'alphabetic',
        measureText: (text: string) => ({ width: text.length * 7, actualBoundingBoxAscent: 8, actualBoundingBoxDescent: 2 }),
        save() { }, restore() { },
        beginPath() { }, fill() { },
        roundRect(_x: number, y: number, _w: number, height: number) { drawn.box = { y, height }; },
        fillText(text: string, _x: number, y: number) { drawn.lines.push({ text, y, baseline: this.textBaseline }); },
    };
    return ctx as CanvasRenderingContext2D;
}

function draw(markdown: string): { drawn: Drawn; size: number } {
    const entry = BuildMarkdown(markdown)[0] as CodeBlockEntry;
    const drawn: Drawn = { box: null, lines: [] };
    entry.render(recordingCtx(drawn), { x: 0, y: 100 }, 1, 400);
    return { drawn, size: entry.text().style().getSize() };
}

describe('a markdown code block', () => {
    it('leaves the same room above its first line as below its last', () => {
        const { drawn, size } = draw('```\nconst a = 1;\nconst b = 2;\n```');
        const box = drawn.box!;
        const first = drawn.lines[0];
        const last = drawn.lines[drawn.lines.length - 1];

        assert.equal(first.baseline, 'top', 'lines are placed by the top of the text');
        const above = first.y - box.y;
        const below = (box.y + box.height) - (last.y + size);
        assert.equal(above, Theme.Note.CodeBlock.Padding);
        assert.equal(below, Theme.Note.CodeBlock.Padding);
    });

    it('does not keep the newline before the closing backticks as an empty last line', () => {
        const { drawn } = draw('```\nconst a = 1;\nconst b = 2;\n```');
        assert.deepEqual(drawn.lines.map((l) => l.text), ['const a = 1;', 'const b = 2;']);
    });

    it('reports the height it drew', () => {
        const entry = BuildMarkdown('```\none\n```')[0] as CodeBlockEntry;
        const drawn: Drawn = { box: null, lines: [] };
        const height = entry.render(recordingCtx(drawn), { x: 0, y: 0 }, 1, 400);
        assert.equal(height, drawn.box!.height);
    });
});
