import { Box, InBox } from '../types/box';
import { Vector2 } from '../types/vector2';
import { CursorStyle } from '../styles/cursor';
import { requestRender } from '../render_scheduler';

export const width = 150;
export const height = 25;

/**
 * Where the pointer is, in canvas pixels, and whether it is over the widget.
 * A press that starts on a widget keeps reporting to it until it is let go,
 * wherever the pointer wanders.
 */
export interface WidgetPointer {
    position: Vector2;
    inside: boolean;
}

export interface Widget {
    /**
     * The smallest room the widget needs, in graph units. The node may hand
     * it a wider box.
     */
    Size(): Vector2;

    Draw(ctx: CanvasRenderingContext2D, box: Box, scale: number, mousePosition: Vector2 | undefined): void;

    PointerDown?(pointer: WidgetPointer): void;
    PointerMove?(pointer: WidgetPointer): void;
    PointerUp?(pointer: WidgetPointer): void;

    Cursor?(): CursorStyle;
    Hidden?(): boolean;
    Disabled?(): boolean;
}

export abstract class WidgetBase implements Widget {

    #hidden = false;

    #disabled = false;

    #hovered = false;

    #pressed = false;

    #box: Box = { Position: { x: 0, y: 0 }, Size: { x: 0, y: 0 } };

    #canvas: HTMLCanvasElement | null = null;

    #scale = 1;

    abstract Size(): Vector2;

    protected abstract render(ctx: CanvasRenderingContext2D, box: Box, scale: number): void;

    Draw(ctx: CanvasRenderingContext2D, box: Box, scale: number, mousePosition: Vector2 | undefined): void {
        this.#box = { Position: { x: box.Position.x, y: box.Position.y }, Size: { x: box.Size.x, y: box.Size.y } };
        this.#canvas = ctx.canvas ?? null;
        this.#scale = scale;
        this.#hovered = !this.#disabled && mousePosition !== undefined && InBox(box, mousePosition);

        ctx.save();
        if (this.#disabled) {
            ctx.globalAlpha *= 0.4;
        }
        this.render(ctx, box, scale);
        ctx.restore();
    }

    PointerDown(pointer: WidgetPointer): void {
        if (this.#disabled) {
            return;
        }
        this.#pressed = true;
        this.onPointerDown(pointer);
        requestRender();
    }

    PointerMove(pointer: WidgetPointer): void {
        if (!this.#pressed) {
            return;
        }
        this.onPointerMove(pointer);
        requestRender();
    }

    PointerUp(pointer: WidgetPointer): void {
        if (!this.#pressed) {
            return;
        }
        this.#pressed = false;
        this.onPointerUp(pointer);
        if (pointer.inside) {
            this.onClick(pointer);
        }
        requestRender();
    }

    Cursor(): CursorStyle {
        return CursorStyle.Pointer;
    }

    Hidden(): boolean {
        return this.#hidden;
    }

    setHidden(hidden: boolean): void {
        this.#hidden = hidden;
        requestRender();
    }

    Disabled(): boolean {
        return this.#disabled;
    }

    setDisabled(disabled: boolean): void {
        this.#disabled = disabled;
        if (disabled) {
            this.#pressed = false;
        }
        requestRender();
    }

    protected hovered(): boolean {
        return this.#hovered;
    }

    protected pressed(): boolean {
        return this.#pressed;
    }

    /**
     * Where the widget was last drawn, in canvas pixels.
     */
    protected box(): Box {
        return this.#box;
    }

    protected canvas(): HTMLCanvasElement | null {
        return this.#canvas;
    }

    protected scale(): number {
        return this.#scale;
    }

    protected onPointerDown(pointer: WidgetPointer): void { }

    protected onPointerMove(pointer: WidgetPointer): void { }

    protected onPointerUp(pointer: WidgetPointer): void { }

    /**
     * A press and release that both landed on the widget.
     */
    protected onClick(pointer: WidgetPointer): void { }
}

interface PropertyReader {
    getProperty(name: string): any;
}

export function startingWidgetValue<T>(
    node: PropertyReader,
    property: string | undefined,
    configured: T | undefined,
    fallback: T,
): T {
    if (configured !== undefined) {
        return configured;
    }
    if (property !== undefined && property !== null) {
        const existing = node.getProperty(property);
        if (existing !== undefined && existing !== null) {
            return existing as T;
        }
    }
    return fallback;
}
