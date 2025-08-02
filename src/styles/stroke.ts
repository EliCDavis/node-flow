export interface StrokeStyleConfig {
    size?: number;
    color?: string;
}

export function StrokeStyleWithFallback(input?: StrokeStyleConfig, fallback?: StrokeStyleConfig): StrokeStyleConfig {
    return {
        color: input?.color === undefined ? fallback?.color : input?.color,
        size: input?.size === undefined ? fallback?.size : input?.size,
    };
}

export class StrokeStyle {
    #size: number;

    #color: string;

    constructor(config?: StrokeStyleConfig) {
        this.#size = config?.size === undefined ? 0.5 : config.size;
        this.#color = config?.color === undefined ? "black" : config.color;
    }

    setupStyle(ctx: CanvasRenderingContext2D, scale: number): void {
        ctx.strokeStyle = this.#color;
        ctx.lineWidth = scale * this.#size;
    }

    setColor(newColor: string): void {
        this.#color = newColor;
    }

    setSize(newSize: number): void {
        this.#size = newSize;
    }

    size(): number {
        return this.#size;
    }
}