import { Theme } from "../theme";
import { Box } from "../types/box";
import { Clamp, Clamp01 } from "../utils/math";
import { FlowNode } from "../node";
import { CursorStyle } from "../styles/cursor";
import { drawFieldBox, drawFieldText } from "./field";
import { formatNumber } from "./number";
import { ValueWidget, ValueWidgetConfig } from "./value";
import { WidgetPointer } from "./widget";

export interface SliderWidgetConfig extends ValueWidgetConfig<number> {
    min?: number;

    max?: number;

    snapIncrement?: number;

    fillColor?: string;
}

export class SliderWidget extends ValueWidget<number> {

    #min: number;

    #max: number;

    #snapIncrement?: number;

    #fillColor: string | undefined;

    #startValue = 0;

    constructor(node: FlowNode, config?: SliderWidgetConfig) {
        const min = config?.min ?? 0;
        const max = config?.max ?? 1;
        super(node, { ...config, value: config?.value === undefined ? undefined : Clamp(config.value, min, max) }, min);
        this.#min = min;
        this.#max = max;
        this.#snapIncrement = config?.snapIncrement;
        this.#fillColor = config?.fillColor;
    }

    Cursor(): CursorStyle {
        return CursorStyle.EWResize;
    }

    setValue(value: number): void {
        super.setValue(Clamp(value, this.#min, this.#max));
    }

    protected render(ctx: CanvasRenderingContext2D, box: Box, scale: number): void {
        drawFieldBox(ctx, box, scale, { input: true, hovered: this.hovered() || this.pressed(), value: "" });

        const border = Theme.Widget.Border.Size * scale;
        const fill = Clamp01((this.value() - this.#min) / (this.#max - this.#min));
        ctx.fillStyle = this.#fillColor ?? Theme.Widget.Slider.FillColor;
        ctx.beginPath();
        ctx.roundRect(
            box.Position.x + (border / 2),
            box.Position.y + (border / 2),
            Math.max(0, (box.Size.x * fill) - border),
            box.Size.y - border,
            Theme.Widget.Border.Radius * scale
        );
        ctx.fill();

        drawFieldText(ctx, box, scale, {
            input: true,
            hovered: false,
            label: this.label(),
            value: formatNumber(Number(this.value().toFixed(3))),
        });
    }

    protected onPointerDown(pointer: WidgetPointer): void {
        this.#startValue = this.value();
        this.input(this.#valueAt(pointer.position.x));
    }

    protected onPointerMove(pointer: WidgetPointer): void {
        this.input(this.#valueAt(pointer.position.x));
    }

    protected onPointerUp(): void {
        this.commit(this.value(), this.#startValue);
    }

    #valueAt(x: number): number {
        const box = this.box();
        const border = Theme.Widget.Border.Size * this.scale();
        const min = box.Position.x + (border / 2);
        const max = min + box.Size.x - border;
        const p = Clamp01((x - min) / (max - min));

        let value = (p * (this.#max - this.#min)) + this.#min;
        if (this.#snapIncrement !== undefined) {
            value = Math.round(value / this.#snapIncrement) * this.#snapIncrement;
        }
        return Clamp(value, this.#min, this.#max);
    }
}
