import { Theme } from "../theme";
import { TextAlign } from "../styles/canvasTextAlign";
import { TextStyle, TextStyleConfig, TextStyleFallback } from "../styles/text";
import { Box } from '../types/box';
import { CopyVector2, Vector2 } from "../types/vector2";
import { Clamp, Clamp01 } from "../utils/math";
import { height, width } from "./widget";
import { TextBaseline } from "../styles/canvasTextBaseline";

export interface SliderWidgetConfig {
    min?: number;

    max?: number;

    value?: number;

    backgroundColor?: string;

    borderColor?: string;

    fillColor?: string;

    textStyle?: TextStyleConfig;

    change?: (newValue: number) => void;

    release?: (newValue: number) => void;

    snapIncrement?: number;
}

export class SliderWidget {

    // Data Variables =========================================================

    #min: number;

    #max: number;

    #value: number;

    #text: string;

    #snapIncrement?: number;

    // Callbacks ==============================================================

    #change?: (newValue: number) => void;

    #release?: (newValue: number) => void;

    // Styling Variables ======================================================

    #textStyle: TextStyle

    #backgroundColor: string;

    #borderColor: string;

    #fillColor: string;

    // Runtime Variables ======================================================

    #lastMousePosition: Vector2;

    #clickStartMousePosition: Vector2;

    #clicking: boolean;

    constructor(config?: SliderWidgetConfig) {
        this.#min = config?.min === undefined ? 0 : config?.min;
        this.#max = config?.max === undefined ? 1 : config?.max;
        this.#value = config?.value === undefined ? 0 : config?.value;
        this.#value = Clamp(this.#value, this.#min, this.#max);
        this.#snapIncrement = config?.snapIncrement;

        this.#change = config?.change;
        this.#release = config?.release;

        this.#backgroundColor = config?.backgroundColor === undefined ? Theme.Widget.BackgroundColor : config?.backgroundColor;
        this.#fillColor = config?.fillColor === undefined ? Theme.Widget.Slider.FillColor : config?.fillColor;
        this.#borderColor = config?.borderColor === undefined ? Theme.Widget.Border.Color : config?.borderColor;
        this.#textStyle = new TextStyle(TextStyleFallback(config?.textStyle, {
            color: Theme.Widget.FontColor,
        }));
        this.#lastMousePosition = { x: 0, y: 0 };
        this.#clickStartMousePosition = { x: 0, y: 0 };
        this.#clicking = false;

        this.#text = this.#value.toFixed(3);
    }

    SetValue(newValue: number): void {
        if (this.#value === newValue) {
            return;
        }

        this.#value = Clamp(newValue, this.#min, this.#max);

        this.#text = this.#value.toFixed(3);
        if (this.#change !== undefined) {
            this.#change(this.#value);
        }
    }

    Size(): Vector2 {
        return { "x": width, "y": height }
    }

    ClickStart(): void {
        this.#clicking = true;
        CopyVector2(this.#clickStartMousePosition, this.#lastMousePosition)
    }

    ClickEnd(): void {
        this.#clicking = false;
        if (this.#release !== undefined) {
            this.#release(this.#value);
        }
    }

    Draw(ctx: CanvasRenderingContext2D, position: Vector2, scale: number, mousePosition: Vector2 | undefined): Box {
        const scaledWidth = width * scale;
        const scaledHeight = height * scale;

        const scaledBorderThickness = Theme.Widget.Border.Size * scale;

        // Render background
        ctx.fillStyle = this.#backgroundColor;
        ctx.strokeStyle = this.#borderColor;
        ctx.lineWidth = scaledBorderThickness;
        ctx.beginPath();
        ctx.roundRect(
            position.x,
            position.y,
            scaledWidth,
            scaledHeight,
            Theme.Widget.Border.Radius * scale
        );
        ctx.fill();
        ctx.stroke();

        // Render Fill
        const fill = Clamp01((this.#value - this.#min) / (this.#max - this.#min));
        ctx.fillStyle = this.#fillColor;
        ctx.beginPath();
        ctx.roundRect(
            position.x + (scaledBorderThickness / 2),
            position.y + (scaledBorderThickness / 2),
            (scaledWidth * fill) - scaledBorderThickness,
            scaledHeight - scaledBorderThickness,
            Theme.Widget.Border.Radius * scale
        );
        ctx.fill();

        // Render Number
        ctx.textAlign = TextAlign.Center;
        ctx.textBaseline = TextBaseline.Middle;
        this.#textStyle.setupStyle(ctx, scale);
        ctx.fillText(
            this.#text,
            position.x + (scaledWidth / 2),
            position.y + (scaledHeight / 2),
        );

        // Update value based on mouse position
        if (mousePosition !== undefined) {
            CopyVector2(this.#lastMousePosition, mousePosition);
            if (this.#clicking) {
                const min = position.x + (scaledBorderThickness / 2);
                const max = min + scaledWidth - scaledBorderThickness;
                const p = Clamp01((this.#lastMousePosition.x - min) / (max - min));

                let value = (p * (this.#max - this.#min)) + this.#min;
                if (this.#snapIncrement !== undefined) {
                    value = Math.round(value / this.#snapIncrement) * this.#snapIncrement;
                }

                this.SetValue(value);
            }
        }

        return {
            Position: position,
            Size: {
                x: scaledWidth,
                y: scaledHeight
            }
        };
    }
}