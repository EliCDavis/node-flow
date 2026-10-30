export function Clamp(v: number, min: number, max: number): number {
    return Math.min(Math.max(v, min), max)
}

export function Clamp01(v: number): number {
    return Clamp(v, 0, 1);
}

