import { strict as assert } from 'assert';
import { Popup } from '../src/popup';

interface StubElement {
    tagName: string;
    style: { cssText: string };
    textContent: string;
    children: Array<StubElement>;
    onclick?: () => void;
    appendChild(child: StubElement): StubElement;
    append(child: StubElement): void;
    removeChild(child: StubElement): void;
}

function element(tagName: string): StubElement {
    return {
        tagName,
        style: { cssText: '' },
        textContent: '',
        children: [],
        appendChild(child) { this.children.push(child); return child; },
        append(child) { this.children.push(child); },
        removeChild(child) { this.children = this.children.filter((c) => c !== child); },
    };
}

function withDocument(run: (fire: (key: string) => void, body: StubElement) => void): void {
    const listeners: Array<(e: unknown) => void> = [];
    const body = element('body');

    const g = globalThis as any;
    const previous = g.document;
    g.document = {
        body,
        createElement: element,
        addEventListener: (_: string, fn: (e: unknown) => void) => listeners.push(fn),
        removeEventListener: (_: string, fn: (e: unknown) => void) => {
            const at = listeners.indexOf(fn);
            if (at >= 0) listeners.splice(at, 1);
        },
    };

    const fire = (key: string) => {
        const event = { key, preventDefault() {}, stopPropagation() {} };
        [...listeners].forEach((fn) => fn(event));
    };

    try {
        run(fire, body);
    } finally {
        g.document = previous;
    }
}

describe('popup', () => {
    it('confirms with the first option when enter is pressed', () => {
        withDocument((fire) => {
            let closedWith: string | null | undefined;
            new Popup({
                title: 'Set Number',
                options: ['Set', 'Cancel'],
                onClose: (button) => { closedWith = button; },
            }).Show();

            fire('Enter');

            assert.equal(closedWith, 'Set', 'enter has to commit, not discard what was typed');
        });
    });

    it('cancels when escape is pressed', () => {
        withDocument((fire) => {
            let called = false;
            let closedWith: string | null | undefined;
            new Popup({
                title: 'Set Number',
                options: ['Set', 'Cancel'],
                onClose: (button) => { called = true; closedWith = button; },
            }).Show();

            fire('Escape');

            assert.equal(called, true);
            assert.equal(closedWith, null);
        });
    });

    it('stops listening once it has closed', () => {
        withDocument((fire, body) => {
            let closes = 0;
            new Popup({
                title: 'Set Number',
                options: ['Set'],
                onClose: () => { closes++; },
            }).Show();

            fire('Enter');
            fire('Enter');

            assert.equal(closes, 1);
            assert.equal(body.children.length, 0, 'and takes itself off the page');
        });
    });
});
