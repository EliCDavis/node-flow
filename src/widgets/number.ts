import { FlowNode } from "../node";
import { CursorStyle } from "../styles/cursor";
import { Box } from "../types/box";
import { drawField } from "./field";
import { editInPlace } from "./inplace";
import { ValueWidget, ValueWidgetConfig } from "./value";
import { WidgetPointer } from "./widget";

export interface NumberWidgetConfig extends ValueWidgetConfig<number> {
    /**
     * How much the value moves per pixel dragged. Left out, it scales with
     * the value's size.
     */
    step?: number;

    integer?: boolean;

    min?: number;

    max?: number;
}

const DRAG_THRESHOLD = 3;

export class NumberWidget extends ValueWidget<number> {

    #step: number | undefined;

    #integer: boolean;

    #min: number;

    #max: number;

    #startX = 0;

    #startValue = 0;

    #dragging = false;

    #dragged = false;

    constructor(node: FlowNode, config?: NumberWidgetConfig) {
        super(node, config, 0);
        this.#step = config?.step;
        this.#integer = config?.integer === true;
        this.#min = config?.min ?? -Infinity;
        this.#max = config?.max ?? Infinity;
    }

    Cursor(): CursorStyle {
        return CursorStyle.EWResize;
    }

    protected render(ctx: CanvasRenderingContext2D, box: Box, scale: number): void {
        drawField(ctx, box, scale, {
            input: true,
            hovered: this.hovered() || this.pressed(),
            label: this.label(),
            value: formatNumber(this.value()),
        });
    }

    protected onPointerDown(pointer: WidgetPointer): void {
        this.#startX = pointer.position.x;
        this.#startValue = this.value();
        this.#dragging = false;
        this.#dragged = false;
    }

    protected onPointerMove(pointer: WidgetPointer): void {
        const dx = pointer.position.x - this.#startX;
        if (!this.#dragging && Math.abs(dx) < DRAG_THRESHOLD) {
            return;
        }
        this.#dragging = true;
        this.input(this.#clean(this.#startValue + (dx * this.#stepFor(this.#startValue))));
    }

    protected onPointerUp(): void {
        this.#dragged = this.#dragging;
        if (this.#dragging) {
            this.#dragging = false;
            this.commit(this.value(), this.#startValue);
        }
    }

    protected onClick(): void {
        if (this.#dragged) {
            return;
        }
        const before = this.value();
        editInPlace({
            canvas: this.canvas(),
            box: this.box(),
            scale: this.scale(),
            value: String(before),
            onCommit: (text) => {
                const parsed = Number.parseFloat(text);
                if (Number.isFinite(parsed)) {
                    this.commit(this.#clean(parsed), before);
                }
            },
        });
    }

    #stepFor(value: number): number {
        if (this.#step !== undefined) {
            return this.#step;
        }
        return Math.max(Math.abs(value) * 0.01, this.#integer ? 0.1 : 0.01);
    }

    #clean(value: number): number {
        const rounded = this.#integer ? Math.round(value) : value;
        return Math.min(this.#max, Math.max(this.#min, rounded));
    }
}

export function formatNumber(value: number): string {
    return '' + parseFloat(value.toPrecision(6));
}
