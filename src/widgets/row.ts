import { Theme } from "../theme";
import { CursorStyle } from "../styles/cursor";
import { Box, InBox } from "../types/box";
import { Vector2 } from "../types/vector2";
import { Widget, WidgetBase, WidgetPointer } from "./widget";

export interface RowWidgetConfig {
    /**
     * How the room beyond each child's own width is shared out. Left out,
     * every child grows the same; 0 keeps a child at its own width.
     */
    grow?: Array<number>;

    gap?: number;
}

export class RowWidget extends WidgetBase {

    #children: Array<Widget>;

    #grow: Array<number>;

    #gap: number;

    #boxes: Array<Box | null> = [];

    #captured: Widget | null = null;

    #capturedBox: Box | null = null;

    #mouse: Vector2 | undefined;

    constructor(children: Array<Widget>, config?: RowWidgetConfig) {
        super();
        this.#children = children;
        this.#grow = config?.grow ?? children.map(() => 1);
        this.#gap = config?.gap ?? Theme.Widget.Gap;
    }

    children(): ReadonlyArray<Widget> {
        return this.#children;
    }

    Size(): Vector2 {
        const shown = this.#shown();
        let x = 0;
        let y = 0;
        for (const child of shown) {
            const size = child.Size();
            x += size.x;
            y = Math.max(y, size.y);
        }
        x += Math.max(0, shown.length - 1) * this.#gap;
        return { x, y };
    }

    Cursor(): CursorStyle {
        const over = this.#captured ?? this.#childAt(this.#mouse);
        return over?.Cursor?.() ?? CursorStyle.Default;
    }

    Draw(ctx: CanvasRenderingContext2D, box: Box, scale: number, mousePosition: Vector2 | undefined): void {
        this.#mouse = mousePosition;
        super.Draw(ctx, box, scale, mousePosition);
    }

    protected render(ctx: CanvasRenderingContext2D, box: Box, scale: number): void {
        const shown = this.#shown();
        const gap = this.#gap * scale;
        const natural = shown.reduce((sum, child) => sum + (child.Size().x * scale), 0);
        const extra = Math.max(0, box.Size.x - natural - (gap * Math.max(0, shown.length - 1)));
        const totalGrow = shown.reduce((sum, child) => sum + this.#growOf(child), 0);

        this.#boxes = this.#children.map(() => null);
        let x = box.Position.x;
        for (const child of shown) {
            const size = child.Size();
            const share = totalGrow > 0 ? extra * (this.#growOf(child) / totalGrow) : 0;
            const childBox: Box = {
                Position: { x, y: box.Position.y + ((box.Size.y - (size.y * scale)) / 2) },
                Size: { x: (size.x * scale) + share, y: size.y * scale },
            };
            this.#boxes[this.#children.indexOf(child)] = childBox;
            child.Draw(ctx, childBox, scale, this.#captured === null || this.#captured === child ? this.#mouse : undefined);
            x += childBox.Size.x + gap;
        }
    }

    protected onPointerDown(pointer: WidgetPointer): void {
        const child = this.#childAt(pointer.position);
        if (child === null || child.Disabled?.()) {
            return;
        }
        this.#captured = child;
        this.#capturedBox = this.#boxes[this.#children.indexOf(child)];
        child.PointerDown?.(this.#forChild(pointer));
    }

    protected onPointerMove(pointer: WidgetPointer): void {
        this.#captured?.PointerMove?.(this.#forChild(pointer));
    }

    protected onPointerUp(pointer: WidgetPointer): void {
        const child = this.#captured;
        const forChild = this.#forChild(pointer);
        this.#captured = null;
        this.#capturedBox = null;
        child?.PointerUp?.(forChild);
    }

    #forChild(pointer: WidgetPointer): WidgetPointer {
        return {
            position: pointer.position,
            inside: this.#capturedBox !== null && InBox(this.#capturedBox, pointer.position),
        };
    }

    #childAt(position: Vector2 | undefined): Widget | null {
        if (position === undefined) {
            return null;
        }
        for (let i = 0; i < this.#children.length; i++) {
            const box = this.#boxes[i];
            if (box && InBox(box, position)) {
                return this.#children[i];
            }
        }
        return null;
    }

    #shown(): Array<Widget> {
        return this.#children.filter((child) => !child.Hidden?.());
    }

    #growOf(child: Widget): number {
        return this.#grow[this.#children.indexOf(child)] ?? 1;
    }
}
