import { strict as assert } from 'assert';
import { MouseObserver } from '../src/input';

function observe(run: (fire: (name: string, event?: any) => void, fireDocument: (name: string, event?: any) => void, left: () => number) => void) {
    const listeners = new Map<string, Array<(e: any) => void>>();
    const documentListeners = new Map<string, Array<(e: any) => void>>();
    const ele: any = {
        style: {},
        addEventListener: (name: string, fn: (e: any) => void) => {
            listeners.set(name, [...(listeners.get(name) ?? []), fn]);
        },
        getBoundingClientRect: () => ({ left: 0, top: 0 }),
    };
    const dispatch = (from: Map<string, Array<(e: any) => void>>) => (name: string, event: any = {}) => {
        event.preventDefault = () => { };
        event.button ??= 0;
        event.clientX ??= 10;
        event.clientY ??= 10;
        (from.get(name) ?? []).forEach((fn) => fn(event));
    };

    let leaves = 0;
    const g = globalThis as any;
    const previous = g.document;
    g.document = {
        addEventListener: (name: string, fn: (e: any) => void) => {
            documentListeners.set(name, [...(documentListeners.get(name) ?? []), fn]);
        },
    };
    try {
        new MouseObserver(ele, () => { }, () => { }, () => { }, () => { }, () => { }, () => { }, () => { },
            () => { leaves++; });
        run(dispatch(listeners), dispatch(documentListeners), () => leaves);
    } finally {
        g.document = previous;
    }
}

describe('the mouse leaving the canvas', () => {
    it('is reported when nothing is held', () => {
        observe((fire, _, left) => {
            fire('mousemove');
            fire('mouseleave');
            assert.equal(left(), 1);
        });
    });

    it('is reported once a drag that left the canvas is let go', () => {
        observe((fire, fireDocument, left) => {
            fire('mousemove');
            fire('mousedown');
            fire('mouseleave');
            assert.equal(left(), 0, 'still dragging');

            fireDocument('mouseup');
            assert.equal(left(), 1);
        });
    });

    it('is not reported when a drag comes back before it is let go', () => {
        observe((fire, fireDocument, left) => {
            fire('mousemove');
            fire('mousedown');
            fire('mouseleave');
            fire('mousemove');
            fireDocument('mouseup');
            assert.equal(left(), 0);
        });
    });
});
