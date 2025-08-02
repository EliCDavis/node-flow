import { Theme } from "../theme";
import { Box, InBox } from "../types/box";
import { CopyVector2, Vector2, Zero } from "../types/vector2";
import { FlowNode } from '../node';
import { Text } from "../types/text";
import { TextStyle, TextStyleConfig, TextStyleFallback } from "../styles/text";

export interface TextWidgetConfig {
    property?: string;

    value?: string;

    textBoxStyle?: TextStyleConfig;

    callback?: (newString: string) => void;
}

export class TextWidget {

    #value: Text;

    #callback?: (newString: string) => void;

    #node: FlowNode

    #nodeProperty: string | undefined;

    #size: Vector2;

    constructor(node: FlowNode, config?: TextWidgetConfig) {
        this.#size = Zero();
        this.#node = node;
        this.#nodeProperty = config?.property;
        this.#value = new Text("", TextStyleFallback(config?.textBoxStyle, {
            font: Theme.FontFamily,
            color: Theme.Widget.FontColor,
            size: Theme.Note.FontSize,
        }))

        this.Set(config?.value === undefined ? "" : config?.value);
        this.#callback = config?.callback;
        if (this.#nodeProperty !== undefined) {
            this.#node.addPropertyChangeListener(this.#nodeProperty, (oldVal, newVal) => {
                this.Set(newVal);
            });
        }
    }

    Size(): Vector2 {
        return this.#size;
    }

    Set(value: string): void {
        if (this.#value.get() === value) {
            return;
        }
        this.#value.set(value);

        if (this.#nodeProperty !== undefined) {
            this.#node.setProperty(this.#nodeProperty, value)
        }

        if (this.#callback !== undefined) {
            this.#callback(value);
        }
    }

    ClickStart(): void {
        // Left blank for implementing Widget interface
    }

    ClickEnd(): void {
        // Left blank for implementing Widget interface
    }


    Draw(ctx: CanvasRenderingContext2D, position: Vector2, scale: number, mousePosition: Vector2 | undefined): Box {
        this.#value.size(ctx, scale, this.#size);
        const box = {
            Position: { x: 0, y: 0 },
            Size: this.#size
        };
        CopyVector2(box.Position, position);
        this.#value.size(ctx, 1, this.#size);
        
        ctx.textAlign = "left";
        this.#value.render(ctx, scale, box.Position);
        // this.#idleStyle.DrawUnderline(ctx, box, scale, fitString(ctx, this.#value, box.Size.x - (20 * scale)))

        return box;
    }
}