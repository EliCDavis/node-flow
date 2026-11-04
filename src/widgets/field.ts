import { Theme } from "../theme";
import { drawBevel } from "../styles/bevel";
import { Box } from "../types/box";
import { fitString } from "../utils/string";

export interface FieldLook {
    hovered: boolean;
    pressed?: boolean;

    /**
     * Something typed or dragged into, as opposed to something pressed.
     */
    input?: boolean;

    label?: string;
    value: string;
    background?: string;
    border?: string;
    textColor?: string;
}

export function widgetFont(scale: number): string {
    return `${Theme.Widget.FontSize * scale}px ${Theme.FontFamily}`;
}

function fieldBackground(look: FieldLook): string {
    if (look.background !== undefined) {
        return look.background;
    }
    if (look.input) {
        return look.hovered ? Theme.Widget.Input.HoverBackgroundColor : Theme.Widget.Input.BackgroundColor;
    }
    if (look.pressed) {
        return Theme.Widget.Button.Click.BackgroundColor;
    }
    return look.hovered ? Theme.Widget.Hover.BackgroundColor : Theme.Widget.BackgroundColor;
}

export function drawFieldBox(ctx: CanvasRenderingContext2D, box: Box, scale: number, look: FieldLook): void {
    ctx.fillStyle = fieldBackground(look);
    ctx.beginPath();
    ctx.roundRect(box.Position.x, box.Position.y, box.Size.x, box.Size.y, Theme.Widget.Border.Radius * scale);
    ctx.fill();

    if (Theme.Widget.Border.Size > 0) {
        ctx.strokeStyle = look.border ?? Theme.Widget.Border.Color;
        ctx.lineWidth = Theme.Widget.Border.Size * scale;
        ctx.stroke();
    }

    if (Theme.Widget.Bevel !== null) {
        drawBevel(ctx, box, scale, Theme.Widget.Bevel, look.input === true || look.pressed === true);
    }
}

/**
 * A boxed value with an optional label: the label on the left and the value
 * on the right, or the value alone in the middle.
 */
export function drawField(ctx: CanvasRenderingContext2D, box: Box, scale: number, look: FieldLook): void {
    drawFieldBox(ctx, box, scale, look);
    drawFieldText(ctx, box, scale, look);
}

export function drawFieldText(ctx: CanvasRenderingContext2D, box: Box, scale: number, look: FieldLook): void {
    const padding = Theme.Widget.Padding * scale;
    const middle = box.Position.y + (box.Size.y / 2);
    const textColor = look.textColor ?? (look.input ? Theme.Widget.Input.FontColor : Theme.Widget.FontColor);

    ctx.font = widgetFont(scale);
    ctx.textBaseline = "middle";

    if (look.label === undefined || look.label === "") {
        ctx.textAlign = "center";
        ctx.fillStyle = textColor;
        ctx.fillText(
            fitString(ctx, look.value, box.Size.x - (padding * 2)),
            box.Position.x + (box.Size.x / 2),
            middle,
        );
        return;
    }

    const room = box.Size.x - (padding * 2);
    const label = fitString(ctx, look.label, room / 2);
    const labelWidth = ctx.measureText(label).width;

    ctx.textAlign = "left";
    ctx.fillStyle = look.textColor ?? Theme.Widget.LabelColor;
    ctx.fillText(label, box.Position.x + padding, middle);

    ctx.textAlign = "right";
    ctx.fillStyle = textColor;
    ctx.fillText(
        fitString(ctx, look.value, room - labelWidth - padding),
        box.Position.x + box.Size.x - padding,
        middle,
    );
}
