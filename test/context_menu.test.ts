import { strict as assert } from 'assert';
import { ContextMenu, ContextMenuConfig } from '../src/contextMenu';
import { setTheme } from '../src/theme';

interface Frame {
    texts: Array<{ text: string; x: number; y: number; fillStyle: string }>;
}

function ctxFor(width: number, frame: Frame): CanvasRenderingContext2D {
    const ctx: any = {
        canvas: { clientWidth: width, clientHeight: 600 },
        font: '', fillStyle: '', strokeStyle: '', lineWidth: 1,
        textAlign: 'left', textBaseline: 'middle', shadowColor: '', shadowBlur: 0,
        measureText: (text: string) => ({ width: text.length * 7, actualBoundingBoxAscent: 8, actualBoundingBoxDescent: 2 }),
        beginPath() { }, roundRect() { }, fill() { }, stroke() { }, lineTo() { }, moveTo() { },
        fillText(text: string, x: number, y: number) { frame.texts.push({ text, x, y, fillStyle: this.fillStyle }); },
    };
    return ctx as CanvasRenderingContext2D;
}

function render(menu: ContextMenu, width: number, at: { x: number; y: number }, mouse: { x: number; y: number }) {
    const frame: Frame = { texts: [] };
    const over = menu.render(ctxFor(width, frame), at, 1, mouse, true);
    return { over, frame, find: (text: string) => frame.texts.find((t) => t.text === text) };
}

const ROW = 30 * 1.25;

const config: ContextMenuConfig = {
    subMenus: [
        { name: 'More', items: [{ name: 'Alpha' }, { name: 'Beta' }] },
        { name: 'Other', items: [{ name: 'Gamma' }] },
    ],
};

describe('a context menu', () => {
    it('opens a submenu on the far side of its parent when the right is out of room', () => {
        const menu = new ContextMenu(config);
        const at = { x: 250, y: 100 };
        const onMore = { x: at.x + 10, y: at.y + ROW / 2 };

        render(menu, 400, at, onMore);
        const { find } = render(menu, 400, at, onMore);

        const alpha = find('Alpha');
        assert.ok(alpha, 'the submenu is open');
        assert.ok(alpha.x < at.x, `the submenu sits left of its parent, not on top of it (at ${alpha.x})`);
    });

    it('lights only the row under the pointer in the frame it moves there', () => {
        setTheme({ ContextMenu: { FontColor: '#000000', HighlightFontColor: '#ffffff' } });
        const menu = new ContextMenu(config);
        const at = { x: 10, y: 100 };

        render(menu, 800, at, { x: at.x + 5, y: at.y + ROW / 2 });
        const moved = render(menu, 800, at, { x: at.x + 5, y: at.y + ROW * 1.5 });
        setTheme();

        assert.equal(moved.find('More')?.fillStyle, '#000000');
        assert.equal(moved.find('Other')?.fillStyle, '#ffffff');
        assert.ok(moved.find('Gamma'), 'the newly hovered row opens its submenu in the same frame');
        assert.ok(!moved.find('Alpha'), 'the old submenu is gone in the same frame');
    });

    it('keeps listening to an open submenu that has to overlap its parent', () => {
        const menu = new ContextMenu(config);
        const at = { x: 10, y: 100 };

        render(menu, 120, at, { x: at.x + 5, y: at.y + ROW / 2 });
        const opened = render(menu, 120, at, { x: at.x + 5, y: at.y + ROW / 2 });
        const beta = opened.find('Beta');
        assert.ok(beta, 'the submenu is open');

        const onBeta = { x: beta.x + 5, y: beta.y };
        render(menu, 120, at, onBeta);
        const hovering = render(menu, 120, at, onBeta);

        assert.equal(hovering.over?.text, 'Beta');
        assert.ok(hovering.find('Alpha'), 'the submenu under the pointer stays open');
        assert.ok(!hovering.find('Gamma'), 'the parent row underneath does not open its own submenu');
    });
});
