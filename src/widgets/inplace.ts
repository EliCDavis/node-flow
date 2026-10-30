import { requestRender } from "../render_scheduler";
import { Theme } from "../theme";
import { Box } from "../types/box";

export interface InPlaceEditConfig {
    canvas: HTMLCanvasElement | null;

    /**
     * Where to sit, in canvas pixels.
     */
    box: Box;

    scale: number;

    value: string;

    onCommit: (text: string) => void;
}

export interface InPlaceEdit {
    input: HTMLInputElement;

    /**
     * Moves the input over where the widget was just drawn, in canvas pixels.
     */
    place(box: Box, scale: number): void;
}

interface OpenEdit {
    canvas: HTMLCanvasElement;
    input: HTMLInputElement;
    placed: boolean;
}

const open = new Set<OpenEdit>();

export function placeEditsDuring(canvas: HTMLCanvasElement, draw: () => void): void {
    open.forEach((edit) => {
        if (edit.canvas === canvas) {
            edit.placed = false;
        }
    });
    draw();
    open.forEach((edit) => {
        if (edit.canvas === canvas && !edit.placed) {
            // Not visibility or display: hiding either way blurs the input, which ends the edit.
            edit.input.style.opacity = "0";
            edit.input.style.pointerEvents = "none";
        }
    });
}

/**
 * Lays a text input over a widget. Enter or clicking away keeps what was
 * typed; Escape throws it away.
 */
export function editInPlace(config: InPlaceEditConfig): InPlaceEdit | null {
    const canvas = config.canvas;
    if (canvas === null) {
        return null;
    }

    const input = document.createElement("input");
    input.type = "text";
    input.value = config.value;
    const edit: OpenEdit = { canvas, input, placed: true };

    const place = (box: Box, scale: number) => {
        const rect = canvas.getBoundingClientRect();
        const sx = canvas.width > 0 ? rect.width / canvas.width : 1;
        const sy = canvas.height > 0 ? rect.height / canvas.height : 1;
        const left = rect.left + (box.Position.x * sx);
        const top = rect.top + (box.Position.y * sy);
        const width = box.Size.x * sx;
        const height = box.Size.y * sy;
        const clip = [
            Math.max(0, rect.top - top),
            Math.max(0, (left + width) - (rect.left + rect.width)),
            Math.max(0, (top + height) - (rect.top + rect.height)),
            Math.max(0, rect.left - left),
        ];

        edit.placed = true;
        input.style.cssText = [
            "position: fixed",
            `left: ${left}px`,
            `top: ${top}px`,
            `width: ${width}px`,
            `height: ${height}px`,
            `clip-path: inset(${clip.map((c) => `${c}px`).join(" ")})`,
            "box-sizing: border-box",
            "margin: 0",
            `padding: 0 ${Theme.Widget.Padding * scale}px`,
            `font: ${Theme.Widget.FontSize * scale * sy}px ${Theme.FontFamily}`,
            `color: ${Theme.Widget.FontColor}`,
            `background: ${Theme.Widget.Hover.BackgroundColor}`,
            `border: ${Theme.Widget.Border.Size * scale}px solid ${Theme.Widget.Border.Color}`,
            `border-radius: ${Theme.Widget.Border.Radius * scale}px`,
            "outline: none",
            "z-index: 1000",
        ].join(";");
    };
    place(config.box, config.scale);

    let done = false;
    const finish = (keep: boolean) => {
        if (done) {
            return;
        }
        done = true;
        open.delete(edit);
        input.remove();
        if (keep) {
            config.onCommit(input.value);
        }
        requestRender();
    };

    input.addEventListener("keydown", (event: KeyboardEvent) => {
        event.stopPropagation();
        if (event.key === "Enter") {
            event.preventDefault();
            finish(true);
        } else if (event.key === "Escape") {
            event.preventDefault();
            finish(false);
        }
    });
    input.addEventListener("blur", () => finish(true));

    open.add(edit);
    document.body.appendChild(input);
    input.focus();
    input.select();
    return { input, place };
}
