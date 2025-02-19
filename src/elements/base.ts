import { Vector2 } from "../types/vector2";
import { Border, BorderStyling, InstantiateRenderElementSidesStyling, IRenderElement, RenderElementSides, RenderElementSidesStyling } from "./interfaces";

export enum Display {
    Flex = "flex",
    None = "none"
}

export interface RenderElementBaseStyling {
    Margin?: RenderElementSidesStyling | number;
    Padding?: RenderElementSidesStyling | number;
    Border?: BorderStyling;
    BackgroundColor?: string;
    MinWidth?: number;
    MaxWidth?: number;
    MaxHeight?: number;
    MinHeight?: number;
    Grow?: number;
    Display?: Display;
}

export abstract class RenderElementBase implements IRenderElement {

    #margin: RenderElementSides;

    #padding: RenderElementSides;

    #border: Border;

    #backgroundColor?: string;

    #minWidth?: number;

    #maxWidth?: number;

    #minHeight?: number;

    #maxHeight?: number;

    #grow?: number;

    #display: Display;

    constructor(config?: RenderElementBaseStyling) {
        this.#margin = InstantiateRenderElementSidesStyling(config?.Margin);
        this.#padding = InstantiateRenderElementSidesStyling(config?.Padding);
        this.#backgroundColor = config?.BackgroundColor;
        this.#border = {
            Color: config?.Border?.Color ?? "black",
            Thickness: config?.Border?.Thickness ?? 0,
            Radius: config?.Border?.Radius ?? 0,
        }
        this.#minWidth = config?.MinWidth;
        this.#maxWidth = config?.MaxWidth;
        this.#minHeight = config?.MinHeight;
        this.#maxHeight = config?.MaxHeight;
        this.#grow = config?.Grow;
        this.#display = config?.Display ?? Display.Flex;
    }

    setBackgroundColor(newColor: string): void {
        this.#backgroundColor = newColor;
    }

    abstract doRender(ctx: CanvasRenderingContext2D, position: Vector2, graphScale: number, scaledFillableSpace: Vector2): void;

    render(ctx: CanvasRenderingContext2D, position: Vector2, graphScale: number, scaledFillableSpace: Vector2): void {
        if (this.#display === Display.None) {
            return;
        }

        const scaledSize = { x: 0, y: 0 };
        this.size(ctx, scaledSize);

        scaledSize.x = scaledSize.x * graphScale;
        scaledSize.y = scaledSize.y * graphScale;
        scaledSize.x = Math.max(scaledSize.x, scaledFillableSpace.x);
        scaledSize.y = Math.max(scaledSize.y, scaledFillableSpace.y);

        if (this.#backgroundColor) {
            ctx.fillStyle = this.#backgroundColor;
            ctx.beginPath();
            ctx.roundRect(
                position.x + (this.#margin.Left * graphScale),
                position.y + (this.#margin.Right * graphScale),
                scaledSize.x - ((this.#margin.Left + this.#margin.Right) * graphScale),
                scaledSize.y - ((this.#margin.Top + this.#margin.Bottom) * graphScale),
                this.#border.Radius * graphScale
            );
            ctx.fill();
        }

        if (this.#border.Thickness > 0) {
            ctx.lineWidth = this.#border.Thickness * graphScale;
            ctx.strokeStyle = this.#border.Color;
            ctx.stroke();
        }

        const offsetPosition = {
            x: position.x + (this.#totalLeftOffset() * graphScale),
            y: position.y + (this.#totalTopOffset() * graphScale),
        };
        const elementSize = {
            x: scaledSize.x - (this.#horizontalOffset() * graphScale),
            y: scaledSize.y - (this.#verticalOffset() * graphScale)
        }
        this.doRender(ctx, offsetPosition, graphScale, elementSize);
    }

    abstract calcSize(ctx: CanvasRenderingContext2D, out: Vector2, limitations: Vector2): void;

    protected maxLimitations(out: Vector2): void {
        out.x = -1;
        out.y = -1;

        if (this.#maxWidth) {
            out.x = this.#maxWidth;
        }

        if (this.#maxHeight) {
            out.y = this.#maxHeight;
        }
    }

    setDisplay(display: Display): void {
        this.#display = display;
    }

    getDisplay(): Display {
        return this.#display;
    }

    size(ctx: CanvasRenderingContext2D, out: Vector2): void {
        out.x = 0;
        out.y = 0;
        if (this.#display === Display.None) {
            return;
        }

        const maxLimits = { x: -1, y: -1 }
        this.maxLimitations(maxLimits);

        this.calcSize(ctx, out, maxLimits);

        out.x += this.#horizontalOffset();
        out.y += this.#verticalOffset();

        if (this.#minWidth) {
            out.x = Math.max(out.x, this.#minWidth)
        }

        if (this.#maxWidth) {
            out.x = Math.min(this.#maxWidth, out.x);
        }

        if (this.#maxHeight) {
            out.y = Math.min(this.#maxHeight, out.y);
        }

        if (this.#minHeight) {
            out.y = Math.max(this.#minHeight, out.y);
        }
    }

    #horizontalOffset(): number {
        return (this.#border.Thickness) +
            this.#margin.Left +
            this.#margin.Right +
            this.#padding.Left +
            this.#padding.Right;
    }

    #verticalOffset(): number {
        return (this.#border.Thickness) +
            this.#margin.Top +
            this.#margin.Bottom +
            this.#padding.Top +
            this.#padding.Bottom;
    }

    #totalTopOffset(): number {
        return (this.#border.Thickness / 2) +
            this.#margin.Top +
            this.#padding.Top;
    }

    #totalLeftOffset(): number {
        return (this.#border.Thickness / 2) +
            this.#margin.Left +
            this.#padding.Left;
    }
}
