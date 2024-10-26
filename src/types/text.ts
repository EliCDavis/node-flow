import { FontWeight, TextStyle, TextStyleConfig } from "../styles/text";
import { splitString, splitStringIntoLines } from "../utils/string";
import { CopyVector2, Vector2 } from "./vector2";

export class Text {

    #measured: boolean

    #size: Vector2;

    #style: TextStyle;

    #value: string

    constructor(value: string, style?: TextStyleConfig) {
        this.#value = value;
        this.#measured = false;
        this.#size = { x: 0, y: 0 };
        this.#style = new TextStyle(style);

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
        const measurements = ctx.measureText(this.#value);
        this.#size.x = measurements.width;
        this.#size.y = measurements.actualBoundingBoxAscent + measurements.actualBoundingBoxDescent;
        this.#measured = true;
    }

    size(ctx: CanvasRenderingContext2D, scale: number, out: Vector2): void {
        this.#measure(ctx);

        CopyVector2(out, this.#size);
        out.x *= scale;
        out.y *= scale;
    }

    setColor(color: string): void {
        this.#style.setColor(color);
    }

    setSize(size: number): void {
        this.#style.setSize(size);
    }

    setWeight(weight: FontWeight): void {
        this.#style.setWeight(weight);
    }

    render(ctx: CanvasRenderingContext2D, scale: number, position: Vector2): void {
        this.#style.setupStyle(ctx, scale)
        ctx.fillText(this.#value, position.x, position.y);
    }

    style(): TextStyle {
        return this.#style;
    }
}