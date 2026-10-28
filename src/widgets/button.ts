import { requestRender } from "../render_scheduler";
import { Box } from "../types/box";
import { Vector2 } from "../types/vector2";
import { drawField } from "./field";
import { height, width, WidgetBase } from "./widget";

export interface ButtonWidgetConfig {
    text?: string;
    callback?: () => void;
    width?: number;
}

export class ButtonWidget extends WidgetBase {

    #text: string;

    #callback?: () => void;

    #width: number;

    constructor(config?: ButtonWidgetConfig) {
        super();
        this.#text = config?.text ?? "Button";
        this.#callback = config?.callback;
        this.#width = config?.width ?? width;
    }

    Size(): Vector2 {
        return { x: this.#width, y: height };
    }

    text(): string {
        return this.#text;
    }

    setText(text: string): void {
        this.#text = text;
        requestRender();
    }

    protected render(ctx: CanvasRenderingContext2D, box: Box, scale: number): void {
        drawField(ctx, box, scale, {
            hovered: this.hovered(),
            pressed: this.pressed(),
            value: this.#text,
        });
    }

    protected onClick(): void {
        this.#callback?.();
    }
}
