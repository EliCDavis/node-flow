import { Theme } from "../theme";
import { Box } from "../types/box";
import { FlowNode } from "../node";
import { drawFieldBox, widgetFont } from "./field";
import { ValueWidget, ValueWidgetConfig } from "./value";
import { fitString } from "../utils/string";

export interface ToggleWidgetConfig extends ValueWidgetConfig<boolean> {
    onColor?: string;
    offColor?: string;
}

export class ToggleWidget extends ValueWidget<boolean> {

    #onColor: string;

    #offColor: string;

    constructor(node: FlowNode, config?: ToggleWidgetConfig) {
        super(node, { ...config, label: config?.label ?? "Toggle" }, false);
        this.#onColor = config?.onColor ?? "#00FF00";
        this.#offColor = config?.offColor ?? "#004400";
    }

    Toggle(): void {
        const before = this.value();
        this.commit(!before, before);
    }

    protected render(ctx: CanvasRenderingContext2D, box: Box, scale: number): void {
        drawFieldBox(ctx, box, scale, { hovered: this.hovered(), value: "" });

        const light = Math.min(box.Size.x, box.Size.y) * 0.6;
        const inset = (box.Size.y - light) / 2;
        const on = this.value();
        ctx.fillStyle = on ? this.#onColor : this.#offColor;
        ctx.beginPath();
        ctx.roundRect(box.Position.x + inset, box.Position.y + inset, light, light, Theme.Widget.Border.Radius * scale);
        if (on) {
            ctx.shadowBlur = 15 * scale;
            ctx.shadowColor = this.#onColor;
        }
        ctx.fill();
        ctx.shadowBlur = 0;

        const textLeft = box.Position.x + (inset * 2) + light;
        ctx.font = widgetFont(scale);
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = Theme.Widget.FontColor;
        const room = box.Position.x + box.Size.x - textLeft - inset;
        ctx.fillText(
            fitString(ctx, this.label(), room),
            textLeft + (room / 2),
            box.Position.y + (box.Size.y / 2),
        );
    }

    protected onClick(): void {
        this.Toggle();
    }
}
