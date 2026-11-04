import { Box } from "../types/box";
import { StrokeStyle, StrokeStyleConfig, StrokeStyleWithFallback } from "./stroke";

export interface BoxStyleConfig {
    border?: StrokeStyleConfig;
    color?: string;
    radius?: number;
}

export function BoxStyleWithFallback(input?: BoxStyleConfig, fallback?: BoxStyleConfig): BoxStyleConfig {
    return {
        radius: input?.radius === undefined ? fallback?.radius : input?.radius,
        color: input?.color === undefined ? fallback?.color : input?.color,
        border: StrokeStyleWithFallback(input?.border, fallback?.border)
    };
}

export class BoxStyle {
    #border: StrokeStyle | null;

    #color: string;

    #radius: number;

    constructor(config?: BoxStyleConfig) {
        this.#color = config?.color === undefined ? "#CCCCCC" : config.color;
        this.#border = config?.border === undefined ? null : new StrokeStyle(config.border);
        this.#radius = config?.radius === undefined ? 2 : config.radius;
    }

    #box(ctx: CanvasRenderingContext2D, box: Box, scale: number, radius: any): void {
        ctx.fillStyle = this.#color
        this.#border?.setupStyle(ctx, scale);
        ctx.beginPath();
        ctx.roundRect(
            box.Position.x,
            box.Position.y,
            box.Size.x,
            box.Size.y,
            radius
        );
        ctx.fill();
    }

    #draw(ctx: CanvasRenderingContext2D, box: Box, scale: number, radius: any): void {
        this.#box(ctx, box, scale, radius);
        ctx.stroke();
    }

    Outline(ctx: CanvasRenderingContext2D, box: Box, scale: number, radius: any): void {
        this.#border?.setupStyle(ctx, scale);
        ctx.beginPath();
        ctx.roundRect(
            box.Position.x,
            box.Position.y,
            box.Size.x,
            box.Size.y,
            radius
        );
        ctx.stroke();
    }

    Draw(ctx: CanvasRenderingContext2D, box: Box, scale: number): void {
        this.#draw(ctx, box, scale, this.#radius * scale)
    }

    DrawRoundedTopOnly(ctx: CanvasRenderingContext2D, box: Box, scale: number): void {
        this.#draw(ctx, box, scale, [this.#radius * scale * 2, this.#radius * scale * 2, 0, 0])
    }

    DrawUnderline(ctx: CanvasRenderingContext2D, box: Box, scale: number): void {
        this.#box(ctx, box, scale, [this.#radius * scale * 2, this.#radius * scale * 2, 0, 0]);
        ctx.beginPath();
        ctx.moveTo(box.Position.x, box.Position.y + box.Size.y)
        ctx.lineTo(box.Position.x + box.Size.x, box.Position.y + box.Size.y);
        ctx.stroke();
    }

    borderSize(): number {
        if (this.#border === null) {
            return 0;
        }
        return this.#border.size();
    }

    radius(): number {
        return this.#radius;
    }

    setColor(color: string): void {
        this.#color = color;
    }

    setBorderColor(color: string): void {
        if (this.#border === null) {
            this.#border = new StrokeStyle({
                color: color
            })
        } else {
            this.#border.setColor(color);
        }
    }

}