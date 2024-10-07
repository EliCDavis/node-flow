import { BuildMarkdown } from "../markdown/markdown";
import { MarkdownEntry } from "../markdown/entry";
import { Popup } from "../popup";
import { BoxStyle } from "../styles/box";
import { TextAlign } from "../styles/canvasTextAlign";
import { TextBaseline } from "../styles/canvasTextBaseline";
import { TextStyleConfig } from "../styles/text";
import { Theme } from "../theme";
import { Box } from "../types/box";
import { CopyVector2, Vector2 } from "../types/vector2";

export interface FlowNoteConfig {
    text?: string;
    style?: TextStyleConfig;
    position?: Vector2;
    width?: number;
    locked?: boolean;
}

export enum DragHandle {
    None,
    Left,
    Right
};

const boundsSpacing = 20;
const boxSize = 10;

export class FlowNote {

    #originalText: string;

    #document: Array<MarkdownEntry>;

    #width: number;

    #edittingStyle: BoxStyle;

    // Runtime ================================================================

    #position: Vector2;

    #handleSelected: DragHandle;

    #edittingLayout: boolean;

    #lastRenderedBox: Box;

    #hovering: boolean;

    // ========================================================================

    constructor(config?: FlowNoteConfig) {
        this.#hovering = false;
        this.#edittingLayout = config?.locked === undefined ? true : !config?.locked;
        this.#width = config?.width === undefined ? 500 : config.width;
        this.#position = config?.position === undefined ? { x: 0, y: 0 } : config.position;
        this.setText(config?.text === undefined ? "" : config?.text);
        this.#lastRenderedBox = { Position: { x: 0, y: 0 }, Size: { x: 0, y: 0 } };
        this.#handleSelected = DragHandle.None;

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

    translate(delta: Vector2): void {
        this.#position.x += delta.x;
        this.#position.y += delta.y;
    }

    handleSelected(): DragHandle {
        return this.#handleSelected;
    }

    selectHandle(handle: DragHandle): void {
        this.#handleSelected = handle;
    }

    #tempPosition: Vector2 = { x: 0, y: 0 };

    render(ctx: CanvasRenderingContext2D, graphPosition: Vector2, scale: number, mousePosition: Vector2 | undefined): void {
        if (this.#edittingLayout && (this.#hovering || this.#handleSelected !== DragHandle.None)) {

            if (mousePosition) {
                if (this.#handleSelected === DragHandle.Right) {

                    const leftPosition = (this.#position.x * scale) + graphPosition.x;
                    this.#width = Math.max((mousePosition.x - leftPosition) / scale, 1)

                } else if (this.#handleSelected === DragHandle.Left) {

                    const scaledWidth = this.#width * scale;
                    const rightPosition = (this.#position.x * scale) + graphPosition.x + scaledWidth;
                    this.#width = Math.max((rightPosition - mousePosition.x) / scale, 1)
                    this.#position.x = rightPosition - (this.#width * scale) - graphPosition.x;
                    this.#position.x /= scale; 
                }
            }

            this.#edittingStyle.Outline(ctx, this.leftResizeHandleBox(), scale, 2);
            this.#edittingStyle.Outline(ctx, this.rightResizeHandleBox(), scale, 2);

            ctx.beginPath();
            const left = this.#lastRenderedBox.Position.x;
            const right = this.#lastRenderedBox.Position.x + this.#lastRenderedBox.Size.x;
            const bottom = this.#lastRenderedBox.Position.y;
            const top = this.#lastRenderedBox.Position.y + this.#lastRenderedBox.Size.y;
            ctx.moveTo(left, bottom + (this.#lastRenderedBox.Size.y / 2) - (boxSize));
            ctx.lineTo(left, bottom);
            ctx.lineTo(right, bottom);
            ctx.lineTo(right, bottom + (this.#lastRenderedBox.Size.y / 2) - (boxSize));

            ctx.moveTo(left, top - (this.#lastRenderedBox.Size.y / 2) + (boxSize));
            ctx.lineTo(left, top);
            ctx.lineTo(right, top);
            ctx.lineTo(right, top - (this.#lastRenderedBox.Size.y / 2) + (boxSize));
            ctx.stroke();
            // this.#edittingStyle.Outline(ctx, bigBox, scale, 2);
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

        this.#lastRenderedBox.Position.x -= boundsSpacing
        this.#lastRenderedBox.Position.y -= boundsSpacing
        this.#lastRenderedBox.Size.x = scale * this.#width + (boundsSpacing * 2);
        this.#lastRenderedBox.Size.y = this.#tempPosition.y - startY + (boundsSpacing * 2);
    }

    leftResizeHandleBox(): Box {
        return {
            Position: {
                x: this.#lastRenderedBox.Position.x - (boxSize / 2),
                y: this.#lastRenderedBox.Position.y + (this.#lastRenderedBox.Size.y / 2) - (boxSize / 2),
            },
            Size: { x: boxSize, y: boxSize, }
        };
    }

    rightResizeHandleBox(): Box {
        return {
            Position: {
                x: this.#lastRenderedBox.Position.x - (boxSize / 2) + this.#lastRenderedBox.Size.x,
                y: this.#lastRenderedBox.Position.y + (this.#lastRenderedBox.Size.y / 2) - (boxSize / 2),
            },
            Size: { x: boxSize, y: boxSize, }
        };
    }

    edittingLayout(): boolean {
        return this.#edittingLayout;
    }

    setHovering(hovering): void {
        this.#hovering = hovering;
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

    lock(): void {
        this.#edittingLayout = false;
    }

    unlock(): void {
        this.#edittingLayout = true;
    }

    bounds(): Box {
        return this.#lastRenderedBox;
    }
}