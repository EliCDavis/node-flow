import { NodeSubsystem } from '../src/nodes/subsystem';
import { PassSubsystem } from '../src/pass/subsystem';
import { FlowNode } from '../src/node';
import { Camera } from '../src/camera';
import { Box } from '../src/types/box';
import { Vector2 } from '../src/types/vector2';
import { Widget } from '../src/widgets/widget';

export interface CanvasRecord {
    fills: Array<string>;
    texts: Array<{ text: string; fillStyle: string; x: number; y: number }>;
}

export function stubCtx(record?: CanvasRecord): CanvasRenderingContext2D {
    const ctx: any = {
        canvas: {
            width: 800,
            height: 600,
            getBoundingClientRect: () => ({ left: 10, top: 20, width: 800, height: 600 }),
        },
        lineWidth: 1,
        font: '',
        textAlign: 'left',
        textBaseline: 'top',
        fillStyle: '',
        strokeStyle: '',
        globalAlpha: 1,
        shadowBlur: 0,
        shadowColor: '',
        measureText: (text: string) => ({ width: text.length * 7, actualBoundingBoxAscent: 8, actualBoundingBoxDescent: 2 }),
        save: () => { }, restore: () => { }, translate: () => { }, scale: () => { },
        beginPath: () => { }, closePath: () => { }, roundRect: () => { }, rect: () => { },
        moveTo: () => { }, lineTo: () => { }, arc: () => { }, ellipse: () => { },
        bezierCurveTo: () => { }, quadraticCurveTo: () => { },
        fill() { record?.fills.push(this.fillStyle); },
        stroke: () => { },
        fillText(text: string, x: number, y: number) { record?.texts.push({ text, fillStyle: this.fillStyle, x, y }); },
        strokeText: () => { },
        clip: () => { }, drawImage: () => { }, setLineDash: () => { },
        createLinearGradient: () => ({ addColorStop: () => { } }),
    };
    return ctx as CanvasRenderingContext2D;
}

export function center(box: Box): Vector2 {
    return { x: box.Position.x + box.Size.x / 2, y: box.Position.y + box.Size.y / 2 };
}

/**
 * A node holding the widget, on a canvas that has been drawn once so the
 * widget has a place.
 */
export function widgetScene(build: (node: FlowNode) => Widget, nodeConfig?: ConstructorParameters<typeof FlowNode>[0]) {
    const graph = new NodeSubsystem(new PassSubsystem());
    const node = new FlowNode({ title: 'test', position: { x: 100, y: 100 }, ...nodeConfig });
    const widget = build(node);
    node.addWidget(widget);
    graph.addNode(node);
    const camera = new Camera();
    const ctx = stubCtx();
    graph.render(ctx, camera, undefined);

    const widgetBox = (): Box => {
        const box = node.widgetPosition(node.widgets().indexOf(widget));
        if (box === undefined) {
            throw new Error('widget was never drawn');
        }
        return box;
    };

    const press = (at: Vector2) => {
        graph.render(ctx, camera, at);
        graph.clickStart(at, camera, false);
        let current = { ...at };
        return {
            moveTo(to: Vector2) {
                graph.mouseDragEvent({ x: to.x - current.x, y: to.y - current.y }, camera.zoom);
                current = { ...to };
                graph.render(ctx, camera, to);
            },
            release() {
                graph.clickEnd();
                graph.render(ctx, camera, current);
            },
        };
    };

    const click = (at: Vector2) => press(at).release();

    return { graph, node, widget, camera, ctx, widgetBox, press, click };
}

export interface StubElement {
    tagName: string;
    type: string;
    value: string;
    style: { cssText: string };
    children: Array<StubElement>;
    isConnected: boolean;
    clicked: number;
    laidOutAt: string;
    openedAt: Array<string>;
    focused: boolean;
    oninput: (() => void) | null;
    onchange: (() => void) | null;
    appendChild(child: StubElement): StubElement;
    append(child: StubElement): void;
    removeChild(child: StubElement): void;
    remove(): void;
    focus(): void;
    select(): void;
    click(): void;
    getBoundingClientRect(): { left: number, top: number, width: number, height: number };
    addEventListener(name: string, fn: (e: any) => void): void;
    fire(name: string, event?: any): void;
}

export function withDocument(run: (body: StubElement, created: Array<StubElement>) => void): void {
    const created: Array<StubElement> = [];
    const element = (tagName: string): StubElement => {
        const listeners = new Map<string, Array<(e: any) => void>>();
        const el: StubElement = {
            tagName,
            type: '',
            value: '',
            style: { cssText: '' },
            children: [],
            isConnected: false,
            clicked: 0,
            laidOutAt: '',
            openedAt: [],
            focused: false,
            oninput: null,
            onchange: null,
            appendChild(child) { this.children.push(child); child.isConnected = true; return child; },
            append(child) { this.children.push(child); child.isConnected = true; },
            removeChild(child) { this.children = this.children.filter((c) => c !== child); child.isConnected = false; },
            remove() { body.removeChild(this); },
            focus() { this.focused = true; },
            select() { },
            click() { this.clicked++; this.openedAt.push(this.laidOutAt); },
            getBoundingClientRect() {
                this.laidOutAt = this.style.cssText;
                return { left: 0, top: 0, width: 0, height: 0 };
            },
            addEventListener(name, fn) {
                listeners.set(name, [...(listeners.get(name) ?? []), fn]);
            },
            fire(name, event) {
                const e = event ?? {};
                e.preventDefault ??= () => { };
                e.stopPropagation ??= () => { };
                (listeners.get(name) ?? []).forEach((fn) => fn(e));
            },
        };
        created.push(el);
        return el;
    };
    const body = element('body');

    const g = globalThis as any;
    const previous = g.document;
    g.document = {
        body,
        createElement: element,
        addEventListener: () => { },
        removeEventListener: () => { },
    };
    try {
        run(body, created);
    } finally {
        g.document = previous;
        created.forEach((el) => el.isConnected = false);
    }
}
