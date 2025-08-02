import { FontWeight, TextStyle, TextStyleConfig } from "../styles/text";
import { splitString, splitStringIntoLines } from "../utils/string";
import { CopyVector2, ScaleVector, Vector2, Zero } from "./vector2";

export interface MultilineTextConfig {
    MaxWidth?: number;
    LineSpacing?: number;
}

export class Text {

    #measured: boolean

    #size: Vector2;

    #style: TextStyle;

    #value: string

    #maxWidth: number;

    #lineSpacing: number;

    #textToRender: Array<string>;

    constructor(value: string, style?: TextStyleConfig, config?: MultilineTextConfig) {
        this.#value = value;
        this.#measured = false;
        this.#size = Zero();
        this.#style = new TextStyle(style);
        this.#maxWidth = config?.MaxWidth ? config?.MaxWidth : -1;
        this.#lineSpacing = config?.LineSpacing ? config?.LineSpacing : 5;
        this.#textToRender = [value];

        if (!document.fonts.check(`16px "${this.#style.getFont()}"`)) {
            document.fonts.addEventListener("loadingdone", (event) => {
                this.#measured = false;
            });
        }
    }

    set(newValue: string): void {
        this.#value = newValue;
        this.#measured = false;
    }

    get(): string {
        return this.#value;
    }

    breakIntoLines(ctx: CanvasRenderingContext2D, maxWidth: number): Array<Text> {
        const results = new Array<Text>();

        this.#style.setupStyle(ctx, 1);
        const entries = splitStringIntoLines(ctx, this.#value, maxWidth);
        if (entries.length === 1) {
            return [this];
        }
        for (let i = 0; i < entries.length; i++) {
            const text = new Text(entries[i])
            text.#style = this.#style;
            results.push(text)
        }

        return results;
    }

    split(char: string): Array<Text> {
        const entries = this.#value.split(char)
        const results = new Array<Text>();
        for (let i = 0; i < entries.length; i++) {
            const text = new Text(entries[i])
            text.#style = this.#style;
            results.push(text)
        }
        return results;
    }

    splitAtIndex(index: number): Array<Text> {
        const results = [
            new Text(this.#value.substring(0, index)),
            new Text(this.#value.substring(index, 0)),
        ];


        for (let i = 0; i < results.length; i++) {
            results[i].#style = this.#style;
        }
        return results;
    }

    splitAtWidth(ctx: CanvasRenderingContext2D, maxWidth: number): Array<Text> {
        this.#style.setupStyle(ctx, 1);
        const entries = splitString(ctx, this.#value, maxWidth);
        if (entries.length === 1) {
            return [this];
        }

        const results = new Array<Text>();
        for (let i = 0; i < entries.length; i++) {
            const text = new Text(entries[i])
            text.#style = this.#style;
            results.push(text)
        }
        return results;
    }

    #measure(ctx: CanvasRenderingContext2D): void {
        if (this.#measured) {
            return;
        }


        this.#style.setupStyle(ctx, 1);

        if (this.#maxWidth == -1) {
            const measurements = ctx.measureText(this.#value);
            this.#size.x = measurements.width;
            this.#size.y = measurements.actualBoundingBoxAscent + measurements.actualBoundingBoxDescent;
            this.#textToRender = [this.#value];
            this.#measured = true;
            return;
        }

        this.#textToRender = splitStringIntoLines(ctx, this.#value, this.#maxWidth);

        this.#size.x = 0;
        this.#size.y = 0;
        for (let i = 0; i < this.#textToRender.length; i++) {
            const measurements = ctx.measureText(this.#textToRender[i]);
            this.#size.x = Math.max(this.#size.x, measurements.width);
        }

        this.#size.y += ((this.#textToRender.length - 1) * this.#lineSpacing) + (this.#style.getSize() * this.#textToRender.length);
        this.#measured = true;
    }

    size(ctx: CanvasRenderingContext2D, scale: number, out: Vector2): void {
        this.#measure(ctx);
        CopyVector2(out, this.#size);
        ScaleVector(out, scale);
    }

    height(ctx: CanvasRenderingContext2D): number {
        this.#measure(ctx);
        return this.#size.y;
    }

    setColor(color: string): void {
        this.#style.setColor(color);
    }

    getColor(): string {
        return this.#style.getColor();
    }

    setSize(size: number): void {
        this.#style.setSize(size);
    }

    setWeight(weight: FontWeight): void {
        this.#style.setWeight(weight);
    }

    render(ctx: CanvasRenderingContext2D, scale: number, position: Vector2): void {
        this.#measure(ctx);
        this.#style.setupStyle(ctx, scale);
        let yOffset = 0;
        for (let i = 0; i < this.#textToRender.length; i++) {
            ctx.fillText(
                this.#textToRender[i],
                position.x,
                position.y + yOffset
            );
            yOffset += (this.#style.getSize() + this.#lineSpacing) * scale
        }
    }

    style(): TextStyle {
        return this.#style;
    }
}