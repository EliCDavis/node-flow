import * as assert from 'assert';
import { BuildMarkdown } from '../src/markdown/markdown';
import { BasicMarkdownEntry, CodeBlockEntry, UnorderedListMarkdownEntry } from '../src/markdown/entry';
import { FontStyle, FontWeight } from '../src/styles/text';
import { Text } from '../src/types/text';

/** The runs of text in an entry, as [content, weight, style] triples. */
function runs(entry: any): Array<[string, FontWeight, FontStyle]> {
    let lines: ReadonlyArray<Text>;
    if (entry.entries) {
        lines = entry.entries().flatMap((item: any) => item.lines());
    } else if (entry.lines) {
        lines = entry.lines();
    } else {
        lines = [entry.text()];
    }
    return lines.map(line => [
        line.get(),
        line.style().getWeight(),
        line.style().getStyle(),
    ] as [string, FontWeight, FontStyle]);
}

function contentOf(entry: any): string {
    return runs(entry).map(r => r[0]).join('');
}

describe('markdown: paragraphs and headers', () => {
    it('reads a plain line', () => {
        const entries = BuildMarkdown('hello world');
        assert.strictEqual(entries.length, 1);
        assert.strictEqual(contentOf(entries[0]), 'hello world');
    });

    it('reads each header level', () => {
        const entries = BuildMarkdown('# one\n## two\n### three');
        assert.strictEqual(entries.length, 3);
        assert.strictEqual(contentOf(entries[0]), 'one');
        assert.strictEqual(contentOf(entries[1]), 'two');
        assert.strictEqual(contentOf(entries[2]), 'three');
    });

    it('keeps a # that is not at the start of a line as text', () => {
        const entries = BuildMarkdown('issue #42 filed');
        assert.strictEqual(contentOf(entries[0]), 'issue #42 filed');
    });
});

describe('markdown: emphasis', () => {
    it('italicises a single-starred run', () => {
        const entries = BuildMarkdown('*hello*');
        assert.deepStrictEqual(runs(entries[0]), [['hello', FontWeight.Normal, FontStyle.Italic]]);
    });

    it('bolds a double-starred run', () => {
        const entries = BuildMarkdown('**hello**');
        assert.deepStrictEqual(runs(entries[0]), [['hello', FontWeight.Bold, FontStyle.Normal]]);
    });

    it('emphasises a run in the middle of a line', () => {
        const entries = BuildMarkdown('a *b* c');
        assert.deepStrictEqual(runs(entries[0]), [
            ['a ', FontWeight.Normal, FontStyle.Normal],
            ['b', FontWeight.Normal, FontStyle.Italic],
            [' c', FontWeight.Normal, FontStyle.Normal],
        ]);
    });

    it('leaves a star surrounded by spaces alone', () => {
        const entries = BuildMarkdown('2 * 3 * 4');
        assert.strictEqual(contentOf(entries[0]), '2 * 3 * 4');
    });

    it('keeps stars that never matched as text', () => {
        assert.strictEqual(contentOf(BuildMarkdown('*unclosed')[0]), '*unclosed');
        assert.strictEqual(contentOf(BuildMarkdown('a * b')[0]), 'a * b');
    });

    it('keeps the stars left over when the runs are uneven', () => {
        // Two opened, one closed: the extra opener is just a character.
        assert.deepStrictEqual(runs(BuildMarkdown('**a*')[0]), [
            ['*', FontWeight.Normal, FontStyle.Normal],
            ['a', FontWeight.Normal, FontStyle.Italic],
        ]);
        assert.deepStrictEqual(runs(BuildMarkdown('*a**')[0]), [
            ['a', FontWeight.Normal, FontStyle.Italic],
            ['*', FontWeight.Normal, FontStyle.Normal],
        ]);
    });

    it('does not emphasise across a space held against the stars', () => {
        assert.strictEqual(contentOf(BuildMarkdown('** a **')[0]), '** a **');
        assert.strictEqual(contentOf(BuildMarkdown('**a **')[0]), '**a **');
    });

    it('emphasises a run holding a space in the middle', () => {
        assert.deepStrictEqual(runs(BuildMarkdown('**a f**')[0]), [
            ['a f', FontWeight.Bold, FontStyle.Normal],
        ]);
    });

    it('never produces an empty run', () => {
        for (const source of ['*a*', '**a**', '*a**', '**a*', '* a *', 'a `b` c']) {
            for (const [content] of runs(BuildMarkdown(source)[0])) {
                assert.notStrictEqual(content, '', `${source} produced an empty run`);
            }
        }
    });

    it('emphasises more than one run on a line', () => {
        const entries = BuildMarkdown('*a* and *b*');
        assert.deepStrictEqual(runs(entries[0]), [
            ['a', FontWeight.Normal, FontStyle.Italic],
            [' and ', FontWeight.Normal, FontStyle.Normal],
            ['b', FontWeight.Normal, FontStyle.Italic],
        ]);
    });
});

describe('markdown: lists', () => {
    it('collects consecutive star lines into one list', () => {
        const entries = BuildMarkdown('* one\n* two\n* three');
        assert.strictEqual(entries.length, 1);
        assert.ok(entries[0] instanceof UnorderedListMarkdownEntry);
        assert.strictEqual((entries[0] as any).entries().length, 3);
    });

    it('ends the list at the first line that is not one', () => {
        const entries = BuildMarkdown('* one\n* two\nafter');
        assert.strictEqual(entries.length, 2);
        assert.ok(entries[0] instanceof UnorderedListMarkdownEntry);
        assert.strictEqual(contentOf(entries[1]), 'after');
    });
});

describe('markdown: code', () => {
    it('sets inline code apart without keeping the backticks', () => {
        const entry = BuildMarkdown('a `b` c')[0] as any;
        assert.deepStrictEqual(runs(entry).map(r => r[0]), ['a ', 'b', ' c']);
        assert.strictEqual(entry.lines()[1].style().getFont(), 'monospace');
        assert.notStrictEqual(entry.lines()[0].style().getFont(), 'monospace');
    });

    it('keeps a lone backtick as text', () => {
        assert.strictEqual(contentOf(BuildMarkdown('a ` b')[0]), 'a ` b');
    });

    it('keeps a fenced block verbatim', () => {
        const entries = BuildMarkdown('```\nlet a = *b*;\n```');
        assert.strictEqual(entries.length, 1);
        assert.ok(entries[0] instanceof CodeBlockEntry, `got ${entries[0].constructor.name}`);
        assert.strictEqual(contentOf(entries[0]), 'let a = *b*;\n');
    });

    it('keeps more than one line of a fenced block', () => {
        const entries = BuildMarkdown('```\none\ntwo\n```');
        assert.strictEqual(contentOf(entries[0]), 'one\ntwo\n');
    });

    it('carries on after a fenced block', () => {
        const entries = BuildMarkdown('```\ncode\n```\nafter');
        assert.strictEqual(entries.length, 2);
        assert.strictEqual(contentOf(entries[1]), 'after');
    });
});
