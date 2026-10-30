import { Theme, themeVersion } from "../theme";
import { Box } from "../types/box";
import { Vector2, Zero } from "../types/vector2";
import { FlowNode } from '../node';
import { Text } from "../types/text";
import { TextStyleConfig, TextStyleFallback } from "../styles/text";
import { CursorStyle } from "../styles/cursor";
import { requestRender } from "../render_scheduler";
import { WidgetBase } from "./widget";

export interface TextWidgetConfig {
    property?: string;
    value?: string;
    textBoxStyle?: TextStyleConfig;
}

export class TextWidget extends WidgetBase {

    #value: Text;

    #size: Vector2;

    #styleConfig: TextStyleConfig | undefined;

    #styledForTheme = -1;

    #followTheme(): void {
        if (this.#styledForTheme === themeVersion()) {
            return;
        }
        this.#styledForTheme = themeVersion();
        const style = this.#value.style();
        style.setColor(this.#styleConfig?.color ?? Theme.Widget.FontColor);
        style.setSize(this.#styleConfig?.size ?? Theme.Note.FontSize);
    }

    constructor(node: FlowNode, config?: TextWidgetConfig) {
        super();
        this.#size = Zero();
        this.#styleConfig = config?.textBoxStyle;
        this.#value = new Text("", TextStyleFallback(config?.textBoxStyle, {}));
        this.#followTheme();
        this.setText(config?.value ?? "");

        const property = config?.property;
        if (property !== undefined) {
            const existing = node.getProperty(property);
            if (existing !== undefined && existing !== null) {
                this.setText(String(existing));
            }
            node.addPropertyChangeListener(property, (_, next) => this.setText(String(next)));
        }
    }

    Cursor(): CursorStyle {
        return CursorStyle.Default;
    }

    Size(): Vector2 {
        return this.#size;
    }

    text(): string {
        return this.#value.get();
    }

    setText(value: string): void {
        if (this.#value.get() === value) {
            return;
        }
        this.#value.set(value);
        requestRender();
    }

    protected render(ctx: CanvasRenderingContext2D, box: Box, scale: number): void {
        this.#followTheme();
        this.#value.size(ctx, 1, this.#size);
        ctx.textAlign = "left";
        this.#value.render(ctx, scale, box.Position);
    }
}
