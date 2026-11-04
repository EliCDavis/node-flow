import { BevelColors } from "../theme";
import { Box } from "../types/box";

export function drawBevel(ctx: CanvasRenderingContext2D, box: Box, scale: number, colors: BevelColors, sunken: boolean): void {
    const width = Math.max(1, 2 * scale);
    const half = width / 2;
    const left = box.Position.x + half;
    const top = box.Position.y + half;
    const right = box.Position.x + box.Size.x - half;
    const bottom = box.Position.y + box.Size.y - half;

    ctx.save();
    ctx.lineWidth = width;
    ctx.lineCap = "square";

    ctx.strokeStyle = sunken ? colors.Dark : colors.Light;
    ctx.beginPath();
    ctx.moveTo(left, bottom);
    ctx.lineTo(left, top);
    ctx.lineTo(right, top);
    ctx.stroke();

    ctx.strokeStyle = sunken ? colors.Light : colors.Dark;
    ctx.beginPath();
    ctx.moveTo(right, top);
    ctx.lineTo(right, bottom);
    ctx.lineTo(left, bottom);
    ctx.stroke();

    ctx.restore();
}
