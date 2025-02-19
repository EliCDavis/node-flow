import { Theme } from "../theme";
import { Box, InBox } from "../types/box";
import { CopyVector2, Vector2 } from "../types/vector2";
import { height, width } from "./widget";
import { TextBoxStyle, TextBoxStyleConfig, TextBoxStyleWithFallback } from "../styles/textBox";
import { FlowNode } from "../node";

export interface ToggleStyleConfig {
    idle?: TextBoxStyleConfig,
    hover?: TextBoxStyleConfig,
    lightColor?: string;
    lightBorderColor?: string;
    lightBlur?: number;
}

export interface ToggleWidgetConfig {
    property?: string;
    value?: boolean;
    text?: string;
    callback?: () => void;
    enabledStyle?: ToggleStyleConfig;
    disabledStyle?: ToggleStyleConfig;
}

class ToggleStyle {

    #idleStyle: TextBoxStyle;

    #hoverStyle: TextBoxStyle;

    #lightColor: string;

    #lightBorderColor: string;

    #lightBlur?: number;

    #box: Box;

    constructor(config?: ToggleStyleConfig) {
        this.#idleStyle = new TextBoxStyle(TextBoxStyleWithFallback(config?.idle, {
            box: {
                color: Theme.Widget.BackgroundColor,
                border: {
                    size: Theme.Widget.Border.Size,
                    color: Theme.Widget.Border.Color,
                }
            },
            text: { color: Theme.Widget.FontColor },
        }));
        this.#hoverStyle = new TextBoxStyle(TextBoxStyleWithFallback(config?.hover, {
            box: {
                color: Theme.Widget.Hover.BackgroundColor,
                border: {
                    size: Theme.Widget.Border.Size,
                    color: Theme.Widget.Border.Color,
                }
            },
            text: { color: Theme.Widget.FontColor },
        }));
        this.#lightColor = config?.lightColor === undefined ? "#222222" : config.lightColor;
        this.#lightBorderColor = config?.lightBorderColor === undefined ? "black" : config.lightBorderColor;
        this.#lightBlur = config?.lightBlur;

        this.#box = {Position: { x: 0, y: 0 }, Size: { x: 0, y: 0 } };
    }

    Draw(ctx: CanvasRenderingContext2D, pos: Vector2, scale: number, text: string, mousePosition: Vector2 | undefined): Box {
        const scaledWidth = width * scale;
        const scaledHeight = height * scale;
        this.#box.Size.x = scaledWidth;
        this.#box.Size.y = scaledHeight;
        CopyVector2(this.#box.Position, pos);

        // Background
        let style: TextBoxStyle = this.#idleStyle;
        if (mousePosition !== undefined) {
            if (InBox(this.#box, mousePosition)) {
                style = this.#hoverStyle;
            }
        }
        style.Draw(ctx, this.#box, scale, text);

        // Light
        const lightScale = Math.min(scaledWidth, scaledHeight);
        ctx.strokeStyle = this.#lightBorderColor;
        ctx.fillStyle = this.#lightColor
        ctx.beginPath();
        ctx.roundRect(
            pos.x + (lightScale * .2),
            pos.y + (lightScale * .2),
            lightScale * .6,
            lightScale * .6,
            Theme.Widget.Border.Radius * scale
        );
        if (this.#lightBlur) {
            ctx.shadowBlur = this.#lightBlur * scale;
            ctx.shadowColor = this.#lightColor;
        }
        ctx.fill();
        if (this.#lightBlur) {
            ctx.shadowBlur = 0;
        }
        // ctx.stroke();

        return this.#box
    }
}

export class ToggleWidget {

    #node: FlowNode;

    #nodeProperty: string | undefined;

    #value: boolean;

    #text: string;

    #enabledStyle: ToggleStyle;

    #disabledStyle: ToggleStyle;

    #callback?: (value: boolean) => void;

    constructor(node: FlowNode, config?: ToggleWidgetConfig) {
        this.#node = node;
        this.#nodeProperty = config?.property;
        this.#text = config?.text === undefined ? "Toggle" : config?.text;

        this.#enabledStyle = new ToggleStyle({
            idle: TextBoxStyleWithFallback(config?.enabledStyle?.idle, {
                box: {
                    color: Theme.Widget.BackgroundColor,
                    border: {
                        size: Theme.Widget.Border.Size,
                        color: Theme.Widget.Border.Color,
                    }
                },
                text: { color: Theme.Widget.FontColor },
            }),
            lightBorderColor: config?.enabledStyle?.lightBorderColor,
            lightColor: config?.enabledStyle?.lightColor === undefined ? "#00FF00" : config?.enabledStyle?.lightColor,
            lightBlur: config?.enabledStyle?.lightBlur === undefined ? 15 : config?.enabledStyle?.lightBlur
        });
        this.#disabledStyle = new ToggleStyle({
            idle: TextBoxStyleWithFallback(config?.disabledStyle?.idle, {
                box: {
                    color: Theme.Widget.BackgroundColor,
                    border: {
                        size: Theme.Widget.Border.Size,
                        color: Theme.Widget.Border.Color,
                    }
                },
                text: { color: Theme.Widget.FontColor },
            }),
            lightBorderColor: config?.disabledStyle?.lightBorderColor,
            lightColor: config?.disabledStyle?.lightColor === undefined ? "#004400" : config?.enabledStyle?.lightColor,
        });

        this.Set(config?.value === undefined ? false : config?.value);
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

    Draw(ctx: CanvasRenderingContext2D, position: Vector2, scale: number, mousePosition: Vector2 | undefined): Box {
        let style = this.#value ? this.#enabledStyle : this.#disabledStyle;
        return style.Draw(ctx, position, scale, this.#text, mousePosition);
    }

    Toggle(): void {
        this.Set(!this.#value);
    }

    Set(value: boolean): void {
        if (this.#value === value) {
            return;
        }
        this.#value = value;

        if (this.#nodeProperty !== undefined) {
            this.#node.setProperty(this.#nodeProperty, this.#value);
        }

        if (this.#callback !== undefined) {
            this.#callback(this.#value);
        }
    }

    ClickStart(): void {
        this.Toggle();
    }

    ClickEnd(): void {
    }
}