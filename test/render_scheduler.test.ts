import * as assert from 'assert';
import { onRenderRequested, renderContinuously, requestRender } from '../src/render_scheduler';

// The scheduler reaches for the global requestAnimationFrame, so the test
// supplies one it can step by hand.
let pending: Array<() => void> = [];

function flush(): number {
    const frame = pending;
    pending = [];
    frame.forEach((cb) => cb());
    return frame.length;
}

describe('render scheduler', () => {
    let unsubscribes: Array<() => void> = [];

    beforeEach(() => {
        pending = [];
        (globalThis as any).requestAnimationFrame = (cb: () => void) => {
            pending.push(cb);
            return pending.length;
        };
    });

    afterEach(() => {
        unsubscribes.forEach((stop) => stop());
        unsubscribes = [];
        pending = [];
        delete (globalThis as any).requestAnimationFrame;
    });

    function subscribe(redraw: () => void): void {
        unsubscribes.push(onRenderRequested(redraw));
    }

    it('redraws once however many times it was asked', () => {
        let draws = 0;
        subscribe(() => { draws++; });

        requestRender();
        requestRender();
        requestRender();

        assert.strictEqual(pending.length, 1, 'only one frame is ever queued');
        flush();
        assert.strictEqual(draws, 1);
    });

    it('does not redraw when nothing asked', () => {
        let draws = 0;
        subscribe(() => { draws++; });

        flush();
        assert.strictEqual(draws, 0, 'this is the whole point: idle costs nothing');
    });

    it('can be asked again after a frame has gone out', () => {
        let draws = 0;
        subscribe(() => { draws++; });

        requestRender();
        flush();
        requestRender();
        flush();

        assert.strictEqual(draws, 2);
    });

    it('redraws every canvas that is listening', () => {
        let a = 0, b = 0;
        subscribe(() => { a++; });
        subscribe(() => { b++; });

        requestRender();
        flush();

        assert.strictEqual(a, 1);
        assert.strictEqual(b, 1);
    });

    it('stops redrawing one that unsubscribed', () => {
        let draws = 0;
        const stop = onRenderRequested(() => { draws++; });
        stop();

        requestRender();
        flush();

        assert.strictEqual(draws, 0);
    });

    it('keeps asking for frames while held continuous, and stops after', () => {
        let draws = 0;
        subscribe(() => { draws++; });

        const release = renderContinuously();
        flush();
        flush();
        flush();
        assert.ok(draws >= 3, `expected a frame every flush, got ${draws}`);

        release();

        // The frame queued before releasing still lands, which is what
        // draws the final state. Nothing is queued behind it.
        const after = draws;
        flush();
        assert.strictEqual(draws, after + 1, 'the already queued frame still lands');
        flush();
        flush();
        assert.strictEqual(draws, after + 1, 'and then it goes quiet again');
    });

    it('survives having no requestAnimationFrame at all', () => {
        delete (globalThis as any).requestAnimationFrame;
        assert.doesNotThrow(() => requestRender());
    });
});
