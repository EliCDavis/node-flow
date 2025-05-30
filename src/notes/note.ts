import { BuildMarkdown } from "../markdown/markdown";
import { MarkdownEntry } from "../markdown/entry";
import { Popup } from "../popup";
import { BoxStyle } from "../styles/box";
import { TextAlign } from "../styles/canvasTextAlign";
import { TextBaseline } from "../styles/canvasTextBaseline";
import { TextStyleConfig } from "../styles/text";
import { Theme } from "../theme";
import { Box } from "../types/box";
import { CopyVector2, Vector2, Zero } from "../types/vector2";
import { Camera } from "../camera";
import { Metadata } from "../metadata";

export type NoteContentChangeCallback = (node: FlowNote, newContents: string) => void
export type NoteWidthChangeCallback = (node: FlowNote, newWidth: number) => void

export interface FlowNoteConfig {
    text?: string;
    style?: TextStyleConfig;
    metadata?: Metadata;
    position?: Vector2;
    width?: number;
    locked?: boolean;
    onWidthChange?: NoteWidthChangeCallback;
    onContentChange?: NoteContentChangeCallback;
}

export enum DragHandle {
    None,
    Left,
    Right
};

const BOUNDS_SPACING = 20;
const BOX_SIZE = 10;

export class FlowNote {

    #originalText: string;

    #document: Array<MarkdownEntry>;

    #width: number;

    #edittingStyle: BoxStyle;

    // Runtime ================================================================

    #data: Metadata;

    #position: Vector2;

    #handleSelected: DragHandle;

    #edittingLayout: boolean;

    #lastRenderedBox: Box;

    #hovering: boolean;

    // Callbacks ==============================================================

    #widthChangeCallbacks: Array<NoteWidthChangeCallback>;

    #contentChangeCallbacks: Array<NoteContentChangeCallback>;

    // ========================================================================

    constructor(config?: FlowNoteConfig) {
        this.#widthChangeCallbacks = new Array<NoteWidthChangeCallback>();
        this.#contentChangeCallbacks = new Array<NoteContentChangeCallback>();
        this.#data = config?.metadata === undefined ? {} : config?.metadata;
        this.#document = [];
        this.#originalText = "";
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

        if (config?.onWidthChange) {
            this.#widthChangeCallbacks.push(config.onWidthChange);
        }

        if (config?.onContentChange) {
            this.#contentChangeCallbacks.push(config.onContentChange);
        }
    }

    setText(text: string): void {
        this.#originalText = text;
        this.#document = BuildMarkdown(this.#originalText);
        for (let i = 0; i < this.#contentChangeCallbacks.length; i++) {
            this.#contentChangeCallbacks[i](this, text);
        }
    }

    public setMetadataProperty(name: string, value: any): void {
        this.#data[name] = value;
    }

    public getMetadataProperty(name: string): any {
        return this.#data[name];
    }

    text(): string {
        return this.#originalText;
    }

    width(): number {
        return this.#width;
    }

    position(): Vector2 {
        return this.#position;
    }

    translate(delta: Vector2): void {
        this.#position.x += delta.x;
        this.#position.y += delta.y;
    }

    setPosition(position: Vector2): void {
        CopyVector2(this.#position, position);
    }

    handleSelected(): DragHandle {
        return this.#handleSelected;
    }

    selectHandle(handle: DragHandle): void {
        this.#handleSelected = handle;
    }

    #tempPosition: Vector2 = Zero();

    public setWidth(newWidth: number): void {
        if (newWidth === undefined) {
            console.error("Attempted to set note's width to undefined");
        }
        this.#width = newWidth;
        for (let i = 0; i < this.#widthChangeCallbacks.length; i++) {
            this.#widthChangeCallbacks[i](this, newWidth);
        }
    }

    public addWidthChangeListener(callback: NoteWidthChangeCallback): void {
        if (callback === null || callback === undefined) {
            return;
        }
        this.#widthChangeCallbacks.push(callback);
    }

    public addContentChangeListener(callback: NoteContentChangeCallback): void {
        if (callback === null || callback === undefined) {
            return;
        }
        this.#contentChangeCallbacks.push(callback);
    }

    render(ctx: CanvasRenderingContext2D, camera: Camera, mousePosition: Vector2 | undefined): void {
        if (this.#edittingLayout && (this.#hovering || this.#handleSelected !== DragHandle.None)) {

            if (mousePosition) {
                if (this.#handleSelected === DragHandle.Right) {

                    const leftPosition = (this.#position.x * camera.zoom) + camera.position.x;
                    this.setWidth(Math.max((mousePosition.x - leftPosition) / camera.zoom, 1));

                } else if (this.#handleSelected === DragHandle.Left) {

                    const scaledWidth = this.#width * camera.zoom;
                    const rightPosition = (this.#position.x * camera.zoom) + camera.position.x + scaledWidth;
                    this.setWidth(Math.max((rightPosition - mousePosition.x) / camera.zoom, 1));
                    this.#position.x = rightPosition - (this.#width * camera.zoom) - camera.position.x;
                    this.#position.x /= camera.zoom;
                }
            }

            this.#edittingStyle.Outline(ctx, this.leftResizeHandleBox(), camera.zoom, 2);
            this.#edittingStyle.Outline(ctx, this.rightResizeHandleBox(), camera.zoom, 2);

            ctx.beginPath();
            const left = this.#lastRenderedBox.Position.x;
            const right = this.#lastRenderedBox.Position.x + this.#lastRenderedBox.Size.x;
            const bottom = this.#lastRenderedBox.Position.y;
            const top = this.#lastRenderedBox.Position.y + this.#lastRenderedBox.Size.y;
            ctx.moveTo(left, bottom + (this.#lastRenderedBox.Size.y / 2) - (BOX_SIZE));
            ctx.lineTo(left, bottom);
            ctx.lineTo(right, bottom);
            ctx.lineTo(right, bottom + (this.#lastRenderedBox.Size.y / 2) - (BOX_SIZE));

            ctx.moveTo(left, top - (this.#lastRenderedBox.Size.y / 2) + (BOX_SIZE));
            ctx.lineTo(left, top);
            ctx.lineTo(right, top);
            ctx.lineTo(right, top - (this.#lastRenderedBox.Size.y / 2) + (BOX_SIZE));
            ctx.stroke();
            // this.#edittingStyle.Outline(ctx, bigBox, camera.zoom, 2);
        }

        camera.graphSpaceToScreenSpace(this.#position, this.#tempPosition);
        CopyVector2(this.#lastRenderedBox.Position, this.#tempPosition)

        const startY = this.#tempPosition.y;
        const lineSpacing = Theme.Note.EntrySpacing * camera.zoom;

        ctx.textAlign = TextAlign.Left;
        ctx.textBaseline = TextBaseline.Alphabetic;
        for (let i = 0; i < this.#document.length; i++) {
            const text = this.#document[i];
            this.#tempPosition.y += text.render(ctx, this.#tempPosition, camera.zoom, this.#width) + lineSpacing;
        }

        this.#lastRenderedBox.Position.x -= BOUNDS_SPACING
        this.#lastRenderedBox.Position.y -= BOUNDS_SPACING
        this.#lastRenderedBox.Size.x = camera.zoom * this.#width + (BOUNDS_SPACING * 2);
        this.#lastRenderedBox.Size.y = this.#tempPosition.y - startY + (BOUNDS_SPACING * 2);
    }

    leftResizeHandleBox(): Box {
        return {
            Position: {
                x: this.#lastRenderedBox.Position.x - (BOX_SIZE / 2),
                y: this.#lastRenderedBox.Position.y + (this.#lastRenderedBox.Size.y / 2) - (BOX_SIZE / 2),
            },
            Size: { x: BOX_SIZE, y: BOX_SIZE, }
        };
    }

    rightResizeHandleBox(): Box {
        return {
            Position: {
                x: this.#lastRenderedBox.Position.x - (BOX_SIZE / 2) + this.#lastRenderedBox.Size.x,
                y: this.#lastRenderedBox.Position.y + (this.#lastRenderedBox.Size.y / 2) - (BOX_SIZE / 2),
            },
            Size: { x: BOX_SIZE, y: BOX_SIZE, }
        };
    }

    edittingLayout(): boolean {
        return this.#edittingLayout;
    }

    setHovering(hovering: boolean): void {
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