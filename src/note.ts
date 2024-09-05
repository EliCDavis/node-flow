import { BuildMarkdown } from "./markdown";
import { MarkdownEntry } from "./markdown/entry";
import { Popup } from "./popup";
import { BoxStyle } from "./styles/box";
import { TextAlign } from "./styles/canvasTextAlign";
import { TextBaseline } from "./styles/canvasTextBaseline";
import { TextStyleConfig } from "./styles/text";
import { Theme } from "./theme";
import { Box } from "./types/box";
import { CopyVector2, Vector2 } from "./types/vector2";

export interface FlowNoteConfig {
    text?: string;
    style?: TextStyleConfig;
    position?: Vector2;
    width?: number;
}

export class FlowNote {

    #originalText: string;

    #document: Array<MarkdownEntry>;

    #position: Vector2;

    #lastMousePosition: Vector2;

    #width: number;

    #lastRenderedBox: Box;

    #edittingLayout: boolean;

    #edittingStyle: BoxStyle;

    constructor(config?: FlowNoteConfig) {
        this.#edittingLayout = false;
        this.#width = config?.width === undefined ? 500 : config.width;
        this.#position = config?.position === undefined ? { x: 0, y: 0 } : config.position;
        this.#lastMousePosition = { x: 0, y: 0 }
        this.setText(config?.text === undefined ? "" : config?.text);
        this.#lastRenderedBox = { Position: { x: 0, y: 0 }, Size: { x: 0, y: 0 } };

        this.#edittingStyle = new BoxStyle({
            border: {
                color: "white",
                size: 1
            },
        })
    }

    setText(text: string): void {
        this.#originalText = text;
        this.#document = BuildMarkdown(this.#originalText);
    }

    #tempPosition: Vector2 = { x: 0, y: 0 };

    render(ctx: CanvasRenderingContext2D, graphPosition: Vector2, scale: number, mousePosition: Vector2 | undefined): void {
        if (this.#edittingLayout) {

            if (mousePosition) {
                CopyVector2(this.#lastMousePosition, mousePosition);
                this.#width = mousePosition.x - (this.#position.x + graphPosition.x)
            }

            const bigBox: Box = {
                Position: {
                    x: this.#lastRenderedBox.Position.x - 10,
                    y: this.#lastRenderedBox.Position.y - 10,
                },
                Size: {
                    x: this.#lastRenderedBox.Size.x + 20,
                    y: this.#lastRenderedBox.Size.y + 20,
                }
            }
            const smallBox: Box = {
                Position: {
                    x: this.#lastRenderedBox.Position.x + this.#lastRenderedBox.Size.x,
                    y: this.#lastRenderedBox.Position.y + this.#lastRenderedBox.Size.y,
                },
                Size: { x: 10, y: 10, }
            }
            this.#edittingStyle.Outline(ctx, bigBox, scale, 2);
            this.#edittingStyle.Outline(ctx, smallBox, scale, 2);
        }
        const startY = (this.#position.y * scale) + graphPosition.y;

        this.#tempPosition.x = (this.#position.x * scale) + graphPosition.x;
        this.#tempPosition.y = startY;
        CopyVector2(this.#lastRenderedBox.Position, this.#tempPosition)

        const lineSpacing = Theme.Note.EntrySpacing * scale;

        ctx.textAlign = TextAlign.Left;
        ctx.textBaseline = TextBaseline.Alphabetic;
        for (let i = 0; i < this.#document.length; i++) {
            const text = this.#document[i];
            this.#tempPosition.y += text.render(ctx, this.#tempPosition, scale, this.#width) + lineSpacing;
        }

        this.#lastRenderedBox.Size.x = scale * this.#width;
        this.#lastRenderedBox.Size.y = this.#tempPosition.y - startY;
    }

    editContent(): void {
        let input: HTMLTextAreaElement | null = null;
        let saveText = "Save";

        const popup = new Popup({
            title: "Edit Note",
            options: [saveText, "Cancel"],
            content: () => {
                const container = document.createElement('div');
                input = document.createElement('textarea')
                input.rows = 8;
                input.cols = 50;
                input.value = this.#originalText;
                container.append(input);
                return container;
            },
            onClose: (button: string | null): void => {
                if (button !== saveText || input === null) {
                    return;
                }
                this.setText(input.value);
            },
        });

        popup.Show();
    }

    editLayout(): void {
        this.#edittingLayout = true;
    }

    bounds(): Box {
        return this.#lastRenderedBox;
    }
}