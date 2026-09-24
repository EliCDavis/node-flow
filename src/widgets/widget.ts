import { Box } from '../types/box';
import { Vector2 } from '../types/vector2';

export const width = 150;
export const height = 25;

export interface Widget {
    Size(): Vector2
    Draw(ctx: CanvasRenderingContext2D, position: Vector2, scale: number, mousePosition: Vector2 | undefined): Box
    ClickStart(): void
    ClickEnd(): void
}

interface PropertyReader {
    getProperty(name: string): any;
}

export function startingWidgetValue<T>(
    node: PropertyReader,
    property: string | undefined,
    configured: T | undefined,
    fallback: T,
): T {
    if (configured !== undefined) {
        return configured;
    }
    if (property !== undefined && property !== null) {
        const existing = node.getProperty(property);
        if (existing !== undefined && existing !== null) {
            return existing as T;
        }
    }
    return fallback;
}