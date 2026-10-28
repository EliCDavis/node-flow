import { HexToColor } from "../utils/color";
import { Box } from "../types/box";
import { drawField } from "./field";
import { FlowNode } from "../node";
import { ValueWidget, ValueWidgetConfig } from "./value";

export interface ColorWidgetConfig extends ValueWidgetConfig<string> { }

function contrastColor(color: string): string {
    const c = HexToColor(color);
    if (c === null) {
        return "black";
    }

    if ((c.r + c.g + c.b) / 3 > 0.5) {
        return "black"
    }

    return "white";
}

let picker: HTMLInputElement | null = null;

function sharedPicker(): HTMLInputElement {
    if (picker === null || !picker.isConnected) {
        picker = document.createElement("input");
        picker.type = "color";
        document.body.appendChild(picker);
    }
    return picker;
}

export class ColorWidget extends ValueWidget<string> {

    #contrast: string;

    constructor(node: FlowNode, config?: ColorWidgetConfig) {
        super(node, config, "#000000");
        this.#contrast = contrastColor(this.value());
    }

    protected valueChanged(): void {
        this.#contrast = contrastColor(this.value());
    }

    protected render(ctx: CanvasRenderingContext2D, box: Box, scale: number): void {
        drawField(ctx, box, scale, {
            input: true,
            hovered: this.hovered(),
            label: this.label(),
            value: this.value(),
            background: this.value(),
            border: this.#contrast,
            textColor: this.#contrast,
        });
    }

    protected onClick(): void {
        const canvas = this.canvas();
        if (canvas === null) {
            return;
        }

        const before = this.value();
        // The browser's picker has no alpha, so the old alpha is carried over.
        const alpha = before.slice(7);
        const box = this.box();
        const rect = canvas.getBoundingClientRect();
        const sx = canvas.width > 0 ? rect.width / canvas.width : 1;
        const sy = canvas.height > 0 ? rect.height / canvas.height : 1;

        const input = sharedPicker();
        input.style.cssText = [
            "position: fixed",
            `left: ${rect.left + (box.Position.x * sx)}px`,
            `top: ${rect.top + (box.Position.y * sy)}px`,
            `width: ${box.Size.x * sx}px`,
            `height: ${box.Size.y * sy}px`,
            "opacity: 0",
            "pointer-events: none",
            "border: 0",
            "padding: 0",
        ].join(";");
        input.value = before.slice(0, 7);
        input.oninput = () => this.input(input.value + alpha);
        input.onchange = () => this.commit(input.value + alpha, before);
        // Reading the rect lays the input out first; the picker opens at its last laid-out spot.
        input.getBoundingClientRect();
        input.click();
    }
}
