import { strict as assert } from 'assert';
import { MouseObserver } from '../src/input';

function observe(run: (fire: (name: string, event: any) => void, zoom: () => number) => void) {
    const listeners = new Map<string, Array<(e: any) => void>>();
    const ele: any = {
        style: {},
        clientHeight: 600,
        addEventListener: (name: string, fn: (e: any) => void) => {
            listeners.set(name, [...(listeners.get(name) ?? []), fn]);
        },
        getBoundingClientRect: () => ({ left: 0, top: 0 }),
    };
    const fire = (name: string, event: any) => {
        event.preventDefault = () => { };
        (listeners.get(name) ?? []).forEach((fn) => fn(event));
    };

    let zoom = 1;
    const g = globalThis as any;
    const previous = { document: g.document, WheelEvent: g.WheelEvent };
    g.document = { addEventListener: () => { } };
    g.WheelEvent = { DOM_DELTA_PIXEL: 0, DOM_DELTA_LINE: 1, DOM_DELTA_PAGE: 2 };
    try {
        new MouseObserver(ele, () => { }, () => { }, () => { }, () => { }, () => { }, () => { },
            (factor) => { zoom *= factor; });
        run(fire, () => zoom);
    } finally {
        g.document = previous.document;
        g.WheelEvent = previous.WheelEvent;
    }
}

function fingers(apart: number) {
    return { touches: [{ clientX: 300 - apart / 2, clientY: 300 }, { clientX: 300 + apart / 2, clientY: 300 }] };
}

describe('pinch to zoom', () => {
    it('doubles the zoom when the fingers spread to twice as far apart', () => {
        observe((fire, zoom) => {
            fire('touchstart', fingers(100));
            fire('touchmove', fingers(125));
            fire('touchmove', fingers(150));
            fire('touchmove', fingers(200));

            assert.ok(Math.abs(zoom() - 2) < 1e-9, `zoom was ${zoom()}`);
        });
    });

    it('halves the zoom when the fingers close to half as far apart', () => {
        observe((fire, zoom) => {
            fire('touchstart', fingers(300));
            fire('touchmove', fingers(200));
            fire('touchmove', fingers(150));

            assert.ok(Math.abs(zoom() - 0.5) < 1e-9, `zoom was ${zoom()}`);
        });
    });
});

describe('the scroll wheel', () => {
    it('zooms in scrolling up and out scrolling down', () => {
        observe((fire, zoom) => {
            fire('wheel', { deltaY: -100, deltaMode: 0, clientX: 0, clientY: 0 });
            assert.ok(zoom() > 1);

            fire('wheel', { deltaY: 200, deltaMode: 0, clientX: 0, clientY: 0 });
            assert.ok(zoom() < 1);
        });
    });

    it('never flips the zoom however far a page scroll goes', () => {
        observe((fire, zoom) => {
            fire('wheel', { deltaY: 10, deltaMode: 2, clientX: 0, clientY: 0 });
            assert.ok(zoom() > 0);
        });
    });
});
