import { Theme } from "../theme";
import { TextBoxStyle, TextBoxStyleConfig, TextBoxStyleWithFallback } from "../styles/textBox";
import { Box, InBox } from "../types/box";
import { CopyVector2, Vector2 } from "../types/vector2";
import { fitString } from "../utils/string";
import { height, width } from "./widget";
import { FlowNode } from '../node';
import { SetStringPopup } from "../popups/string";

export interface StringWidgetConfig {
    property?: string;

    value?: string;

    textBoxStyle?: TextBoxStyleConfig;

    callback?: (newString: string) => void;
}

export class StringWidget {

    #value: string;

    #idleStyle: TextBoxStyle;

    #hoverStyle: TextBoxStyle;

    #callback?: (newString: string) => void;

    #node: FlowNode

    #nodeProperty: string | undefined;

    constructor(node: FlowNode, config?: StringWidgetConfig) {
        this.#node = node;
        this.#nodeProperty = config?.property;
        this.#idleStyle = new TextBoxStyle(TextBoxStyleWithFallback(config?.textBoxStyle, {
            box: {
                color: Theme.Widget.BackgroundColor,
                border: {
                    size: Theme.Widget.Border.Size,
                    color: Theme.Widget.Border.Color,
                },
                radius: Theme.Widget.Border.Radius
            },
            text: { color: Theme.Widget.FontColor },
        }));

        this.#hoverStyle = new TextBoxStyle(TextBoxStyleWithFallback(config?.textBoxStyle, {
            box: {
                color: Theme.Widget.Hover.BackgroundColor,
                border: {
                    size: Theme.Widget.Border.Size,
                    color: Theme.Widget.Border.Color,
                },
                radius: Theme.Widget.Border.Radius
            },
            text: { color: Theme.Widget.FontColor },
        }));

        this.Set(config?.value === undefined ? "" : config?.value);
        this.#callback = config?.callback;
        if (this.#nodeProperty !== undefined) {
            this.#node.addPropertyChangeListener(this.#nodeProperty, (oldVal, newVal) => {
                this.Set(newVal);
            });
        }
    }

    Size(): Vector2 {
        return { "x": width, "y": height }
    }

    Set(value: string): void {
        if (this.#value === value) {
            return;
        }
        this.#value = value;

        if (this.#nodeProperty !== undefined) {
            this.#node.setProperty(this.#nodeProperty, this.#value)
        }

        if (this.#callback !== undefined) {
            this.#callback(this.#value);
        }
    }

    ClickStart(): void {
    }

    ClickEnd(): void {
        const popup = SetStringPopup({
            title: "Set String",
            startingValue: this.#value,
            onUpdate: (value: string): void => {
                this.Set(value);
            },
        });
        popup.Show();
    }

    Draw(ctx: CanvasRenderingContext2D, position: Vector2, scale: number, mousePosition: Vector2 | undefined): Box {
        const box = {
            Position: { x: 0, y: 0 },
            Size: {
                x: width * scale,
                y: height * scale
            }
        };
        CopyVector2(box.Position, position);


        let style: TextBoxStyle = this.#idleStyle;

        if (mousePosition !== undefined) {
            if (InBox(box, mousePosition)) {
                style = this.#hoverStyle;
            }
        }

        style.DrawUnderline(ctx, box, scale, fitString(ctx, this.#value, box.Size.x - (20 * scale)))

        return box;
    }
}