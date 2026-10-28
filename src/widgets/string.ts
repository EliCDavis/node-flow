import { FlowNode } from "../node";
import { CursorStyle } from "../styles/cursor";
import { Box } from "../types/box";
import { drawField } from "./field";
import { editInPlace } from "./inplace";
import { ValueWidget, ValueWidgetConfig } from "./value";

export interface StringWidgetConfig extends ValueWidgetConfig<string> { }

export class StringWidget extends ValueWidget<string> {

    constructor(node: FlowNode, config?: StringWidgetConfig) {
        super(node, config, "");
    }

    Cursor(): CursorStyle {
        return CursorStyle.Text;
    }

    protected render(ctx: CanvasRenderingContext2D, box: Box, scale: number): void {
        drawField(ctx, box, scale, {
            input: true,
            hovered: this.hovered(),
            label: this.label(),
            value: this.value(),
        });
    }

    protected onClick(): void {
        const before = this.value();
        editInPlace({
            canvas: this.canvas(),
            box: this.box(),
            scale: this.scale(),
            value: before,
            onCommit: (text) => this.commit(text, before),
        });
    }
}
