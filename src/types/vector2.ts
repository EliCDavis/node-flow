export interface Vector2 {
    x: number
    y: number
}

export function CopyVector2(dst: Vector2, src: Vector2): void {
    dst.x = src.x;
    dst.y = src.y;
}

export function SubVector2(dst: Vector2, a: Vector2, b: Vector2): void {
    dst.x = a.x - b.x;
    dst.y = a.y - b.y;
}

export function AddVector2(dst: Vector2, a: Vector2, b: Vector2): void {
    dst.x = a.x + b.x;
    dst.y = a.y + b.y;
}

export function Zero(): Vector2 {
    return { x: 0, y: 0 };
}