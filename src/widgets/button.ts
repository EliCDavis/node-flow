import { Theme } from "../theme";
import { TextBoxStyle, TextBoxStyleConfig, TextBoxStyleWithFallback } from "../styles/textBox";
import { Box, InBox } from "../types/box";
import { CopyVector2, Vector2 } from "../types/vector2";
import { height, width } from "./widget";


export interface ButtonWidgetConfig {
    text?: string;
    callback?: () => void;
    idleStyle?: TextBoxStyleConfig;
    hoverStyle?: TextBoxStyleConfig;
    clickStyle?: TextBoxStyleConfig;
}

export class ButtonWidget {

    #text: string;

    #idleStyle: TextBoxStyle;

    #hoverStyle: TextBoxStyle;

    #clickStyle: TextBoxStyle;

    #callback?: () => void;

    #gettingClicked: boolean;

    constructor(config?: ButtonWidgetConfig) {
        this.#text = config?.text === undefined ? "Button" : config?.text;
        this.#callback = config?.callback
        this.#gettingClicked = false;

        this.#idleStyle = new TextBoxStyle(TextBoxStyleWithFallback(config?.idleStyle, {
            box: {
                color: Theme.Widget.BackgroundColor,
                border: {
                    size: Theme.Widget.Border.Size,
                    color: Theme.Widget.Border.Color,
                }
            },
            text: { color: Theme.Widget.FontColor },
        }));
        this.#hoverStyle = new TextBoxStyle(TextBoxStyleWithFallback(config?.hoverStyle, {
            box: {
                color: Theme.Widget.Hover.BackgroundColor,
                border: {
                    size: Theme.Widget.Border.Size,
                    color: Theme.Widget.Border.Color,
                }
            },
            text: { color: Theme.Widget.FontColor },
        }));
        this.#clickStyle = new TextBoxStyle(TextBoxStyleWithFallback(config?.clickStyle, {
            box: { 
                color: Theme.Widget.Button.Click.BackgroundColor,
                border: {
                    size: Theme.Widget.Border.Size,
                    color: Theme.Widget.Border.Color,
                }
            },
            text: { color: Theme.Widget.FontColor },
        }))
    }

    Size(): Vector2 {
        return { "x": width, "y": height }
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

        if (mousePosition !== undefined && !this.#gettingClicked) {
            if (InBox(box, mousePosition)) {
                style = this.#hoverStyle;
            }
        }

        if (this.#gettingClicked) {
            style = this.#clickStyle;
        }
        style.Draw(ctx, box, scale, this.#text);

        return box
    }

    ClickStart(): void {
        this.#gettingClicked = true;
    }

    ClickEnd(): void {
        this.#gettingClicked = false;
        if (this.#callback !== undefined) {
            this.#callback();
        }
    }
}