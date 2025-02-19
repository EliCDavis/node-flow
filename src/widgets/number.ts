import { Theme } from "../theme";
import { Popup } from "../popup";
import { TextBoxStyle, TextBoxStyleConfig, TextBoxStyleWithFallback } from "../styles/textBox";
import { Box, InBox } from '../types/box';
import { CopyVector2, Vector2 } from "../types/vector2";
import { height, width } from "./widget";
import { FlowNode } from "../node";

export interface NumberWidgetConfig {
    value?: number;

    property?: string;

    idleBoxStyle?: TextBoxStyleConfig;

    highlightBoxStyle?: TextBoxStyleConfig;

    callback?: (newNumber: number) => void;
}

export class NumberWidget {

    #node: FlowNode;

    #nodeProperty: string | undefined;

    #value: number;

    #idleBoxStyle: TextBoxStyle;

    #highlightBoxStyle: TextBoxStyle;

    #text: string;

    #callback?: (newNumber: number) => void;

    constructor(node: FlowNode, config?: NumberWidgetConfig) {
        this.#node = node;
        this.#nodeProperty = config?.property;
        this.#idleBoxStyle = new TextBoxStyle(TextBoxStyleWithFallback(config?.idleBoxStyle, {
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
        this.#highlightBoxStyle = new TextBoxStyle(TextBoxStyleWithFallback(config?.highlightBoxStyle, {
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
        this.Set(config?.value === undefined ? 0 : config?.value);
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

    Set(newNumber: number): void {
        if (this.#value === newNumber) {
            return;
        }

        this.#value = newNumber;

        if (this.#nodeProperty !== undefined) {
            this.#node.setProperty(this.#nodeProperty, this.#value);
        }

        if (this.#callback !== undefined) {
            this.#callback(this.#value);
        }

        // https://stackoverflow.com/questions/5765398/whats-the-best-way-to-convert-a-number-to-a-string-in-javascript
        this.#text = '' + parseFloat(this.#value.toPrecision(6));
    }

    ClickStart(): void {
    }

    ClickEnd(): void {
        let input: HTMLInputElement | null = null;

        const setOption = "Set";
        const cancelOption = "Cancel";
        const popup = new Popup({
            title: "Set Number",
            options: [setOption, cancelOption],
            content: () => {
                const container = document.createElement('div');
                input = document.createElement('input')
                input.type = "number";
                input.valueAsNumber = this.#value;
                container.append(input);
                return container;
            },
            onClose: (button: string | null): void => {
                if (button !== setOption || input === null) {
                    return;
                }

                this.Set(input.valueAsNumber);
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

        let style: TextBoxStyle = this.#idleBoxStyle;

        if (mousePosition !== undefined) {
            if (InBox(box, mousePosition)) {
                style = this.#highlightBoxStyle;
            }
        }

        style.DrawUnderline(ctx, box, scale, this.#text)

        return box;
    }
}