import { HexToColor } from "../utils/color";
import { TextStyleConfig } from "../styles/text";
import { Box } from "../types/box";
import { CopyVector2, Vector2 } from "../types/vector2";
import { height, width } from "./widget";
import { Popup } from "../popup";
import { TextBoxStyle } from '../styles/textBox';
import { Theme } from "../theme";
import { FlowNode } from "../node";

export interface ColorWidgetConfig {
    value?: string;

    property?: string;

    textStyle?: TextStyleConfig;

    callback?: (newColor: string) => void;
}

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

export class ColorWidget {

    #node: FlowNode;

    #nodeProperty: string | undefined;

    #value: string;

    #contrast: string;

    #textBoxStyle: TextBoxStyle;

    #callback?: (newColor: string) => void;

    constructor(node: FlowNode, config?: ColorWidgetConfig) {
        this.#node = node;
        this.#nodeProperty = config?.property;
        this.#textBoxStyle = new TextBoxStyle({
            box: {
                color: this.#value,
                border: {
                    color: this.#contrast,
                    size: Theme.Widget.Border.Size
                }
            },
            text: config?.textStyle
        });
        this.Set(config?.value === undefined ? "#000000" : config?.value);
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

        if (this.#callback !== undefined) {
            this.#callback(this.#value);
        }

        if (this.#nodeProperty !== undefined) {
            this.#node.setProperty(this.#nodeProperty, this.#value);
        }

        // Update Styling
        this.#contrast = contrastColor(this.#value);
        this.#textBoxStyle.setBoxColor(this.#value);
        this.#textBoxStyle.setBorderColor(this.#contrast);
        this.#textBoxStyle.setTextColor(this.#contrast);
    }

    ClickStart(): void {
    }

    ClickEnd(): void {
        let input: HTMLInputElement | null = null;

        const popup = new Popup({
            title: "Set Color",
            options: ["Set", "Cancel"],
            content: () => {
                const container = document.createElement('div');

                input = document.createElement('input')
                input.type = "color";
                input.value = this.#value;
                input.name = "color"
                container.append(input);

                const label = document.createElement("label");
                label.htmlFor = "color";
                label.textContent = "Color";
                container.append(label);

                return container;
            },
            onClose: (button: string | null): void => {
                if (button !== "Set" || input === null) {
                    return;
                }

                this.Set(input.value);
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

        this.#textBoxStyle.Draw(ctx, box, scale, this.#value)

        return box;
    }
}