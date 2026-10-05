import { Vector2 } from "../types/vector2"


export interface RenderElementSidesStyling {
    Left?: number
    Right?: number
    Top?: number
    Bottom?: number
}

export interface RenderElementSides {
    Left: number
    Right: number
    Top: number
    Bottom: number
}

export function InstantiateRenderElementSidesStyling(config?: RenderElementSidesStyling | number): RenderElementSides {
    if (typeof config === 'number') {
        return {
            Bottom: config,
            Right: config,
            Top: config,
            Left: config,
        }
    }
    return {
        Bottom: config?.Bottom === undefined ? 0 : config?.Bottom,
        Right: config?.Right === undefined ? 0 : config?.Right,
        Left: config?.Left === undefined ? 0 : config?.Left,
        Top: config?.Top === undefined ? 0 : config?.Top,
    }
}

export interface IRenderElement {
    size(ctx: CanvasRenderingContext2D, out: Vector2): void;
    render(ctx: CanvasRenderingContext2D, position: Vector2, graphScale: number, scaledFillableSpace: Vector2): void;
}

export interface Border {
    Color: string;
    Thickness: number;
    Radius: number;
}

export interface BorderStyling {
    Color?: string;
    Thickness?: number;
    Radius?: number;
}
