import { Theme } from "../theme";
import { Box } from "../types/box";
import { Vector2 } from "../types/vector2";
import { WidgetBase } from "./widget";

export interface HiddenPortsOwner {
    hiddenPortCount(): number;
    hiddenPortsShown(): boolean;
    setHiddenPortsShown(shown: boolean): void;
}

export class HiddenPortsToggle extends WidgetBase {

    constructor(private readonly owner: HiddenPortsOwner) {
        super();
    }

    Size(): Vector2 {
        return { x: 150, y: 16 };
    }

    protected render(ctx: CanvasRenderingContext2D, box: Box, scale: number): void {
        const label = this.owner.hiddenPortsShown() ? "▴ less" : `▾ ${this.owner.hiddenPortCount()} more`;

        const midY = box.Position.y + box.Size.y / 2;
        const centerX = box.Position.x + box.Size.x / 2;

        ctx.font = `${11 * scale}px ${Theme.FontFamily}`;
        const half = ctx.measureText(label).width / 2 + 6 * scale;

        ctx.globalAlpha = this.hovered() ? 1 : 0.5;
        ctx.strokeStyle = Theme.Widget.FontColor;
        ctx.fillStyle = Theme.Widget.FontColor;
        ctx.lineWidth = Math.max(1, scale);
        ctx.beginPath();
        ctx.moveTo(box.Position.x, midY);
        ctx.lineTo(centerX - half, midY);
        ctx.moveTo(centerX + half, midY);
        ctx.lineTo(box.Position.x + box.Size.x, midY);
        ctx.stroke();
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(label, centerX, midY);
    }

    protected onClick(): void {
        this.owner.setHiddenPortsShown(!this.owner.hiddenPortsShown());
    }
}
