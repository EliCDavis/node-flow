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

/**
 * Lays a text input over a widget. Enter or clicking away keeps what was
 * typed; Escape throws it away.
 */
export function editInPlace(config: InPlaceEditConfig): HTMLInputElement | null {
    const canvas = config.canvas;
    if (canvas === null) {
        return null;
    }

    const rect = canvas.getBoundingClientRect();
    const sx = canvas.width > 0 ? rect.width / canvas.width : 1;
    const sy = canvas.height > 0 ? rect.height / canvas.height : 1;

    const input = document.createElement("input");
    input.type = "text";
    input.value = config.value;
    input.style.cssText = [
        "position: fixed",
        `left: ${rect.left + (config.box.Position.x * sx)}px`,
        `top: ${rect.top + (config.box.Position.y * sy)}px`,
        `width: ${config.box.Size.x * sx}px`,
        `height: ${config.box.Size.y * sy}px`,
        "box-sizing: border-box",
        "margin: 0",
        `padding: 0 ${Theme.Widget.Padding * config.scale}px`,
        `font: ${Theme.Widget.FontSize * config.scale * sy}px ${Theme.FontFamily}`,
        `color: ${Theme.Widget.FontColor}`,
        `background: ${Theme.Widget.Hover.BackgroundColor}`,
        `border: ${Theme.Widget.Border.Size * config.scale}px solid ${Theme.Widget.Border.Color}`,
        `border-radius: ${Theme.Widget.Border.Radius * config.scale}px`,
        "outline: none",
        "z-index: 1000",
    ].join(";");

    let done = false;
    const finish = (keep: boolean) => {
        if (done) {
            return;
        }
        done = true;
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

    document.body.appendChild(input);
    input.focus();
    input.select();
    return input;
}
