import { Theme } from "../theme";
import { Vector2 } from "../types/vector2";

export enum FontWeight {
    Normal = "",
    Bold = "bold"
}

export enum FontStyle {
    Normal = "",
    Italic = "italic"
}

export interface TextStyleConfig {
    size?: number;
    color?: string;
    font?: string;
    weight?: FontWeight;
    style?: FontStyle;
}

const DefaultSize: number = 16;
const DefaultColor: string = "black";

export function TextStyleFallback(input?: TextStyleConfig, fallback?: TextStyleConfig): TextStyleConfig {
    return {
        color: input?.color === undefined ? fallback?.color : input?.color,
        size: input?.size === undefined ? fallback?.size : input?.size,
        font: input?.font === undefined ? fallback?.font : input?.font,
        style: input?.style === undefined ? fallback?.style : input?.style,
        weight: input?.weight === undefined ? fallback?.weight : input?.weight,
    };
}

export class TextStyle {

    #size: number;

    #color: string;

    #font: string;

    #weight: FontWeight;

    #fontStyle: FontStyle;

    constructor(config: TextStyleConfig | undefined) {
        this.#size = config?.size === undefined ? DefaultSize : config.size;
        this.#color = config?.color === undefined ? DefaultColor : config.color;
        this.#font = config?.font === undefined ? Theme.FontFamily : config.font;
        this.#weight = config?.weight === undefined ? FontWeight.Normal : config.weight;
        this.#fontStyle = config?.style === undefined ? FontStyle.Normal : config.style;
    }

    setupStyle(ctx: CanvasRenderingContext2D, scale: number): void {
        ctx.fillStyle = this.#color;
        ctx.font = this.#fontStyle + " " + this.#weight + " " + (this.#size * scale) + "px " + this.#font;
    }

    getSize(): number {
        return this.#size;
    }

    getFont(): string {
        return this.#font;
    }

    measure(ctx: CanvasRenderingContext2D, scale: number, text: string, out: Vector2): void {
        this.setupStyle(ctx, scale);
        const measurements = ctx.measureText(text)
        out.x = measurements.width;
        out.y = measurements.actualBoundingBoxAscent + measurements.actualBoundingBoxDescent;
    }

    setColor(color: string): void {
        this.#color = color;
    }

    setSize(size: number): void {
        this.#size = size;
    }

    setWeight(weight: FontWeight): void {
        this.#weight = weight;
    }
}