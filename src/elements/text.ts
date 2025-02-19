import { Text } from "../types/text";
import { CopyVector2, ScaleVector, Vector2, Zero } from "../types/vector2";
import { RenderElementBase, RenderElementBaseStyling } from "./base";

export enum TextAlign {
    Left = "left",
    Right = "right",
    Center = "center",
}

export enum VerticalAlign {
    Top = "top",
    Center = "center",
    Bottom = "bottom"
}

export interface TextElementStyling extends RenderElementBaseStyling {
    Align?: TextAlign
    VerticalAlign?: VerticalAlign
}

export class TextElement extends RenderElementBase {
    #text: Text;

    #align: TextAlign;

    #verticalAlign: VerticalAlign;

    constructor(text: Text, styling?: TextElementStyling) {
        super(styling);
        this.#text = text;
        this.#align = styling?.Align ?? TextAlign.Left;
        this.#verticalAlign = styling?.VerticalAlign ?? VerticalAlign.Top;
    }

    doRender(ctx: CanvasRenderingContext2D, position: Vector2, graphScale: number, scaledFillableSpace: Vector2): void {
        const scale = Zero();
        this.calcSize(ctx, scale);
        ScaleVector(scale, graphScale);

        const justifiedPosition = Zero();
        CopyVector2(justifiedPosition, position)

        ctx.textAlign = "left";
        ctx.textBaseline = "top"

        switch (this.#align) {
            case TextAlign.Left:
                // Do nothing. This is default
                break;

            case TextAlign.Right:
                justifiedPosition.x += scaledFillableSpace.x - scale.x;
                break;

            case TextAlign.Center:
                justifiedPosition.x += (scaledFillableSpace.x - scale.x) / 2;
                break;

            default:
                throw new Error("unimplemented justification: " + this.#align);
        }

        switch (this.#verticalAlign) {
            case VerticalAlign.Top:
                // Do nothing. This is default
                break;

            case VerticalAlign.Bottom:
                justifiedPosition.y += scaledFillableSpace.y - scale.y;
                break;

            case VerticalAlign.Center:
                justifiedPosition.y += (scaledFillableSpace.y - scale.y) / 2;
                break;

            default:
                throw new Error("unimplemented justification: " + this.#align);
        }
        this.#text.render(ctx, graphScale, justifiedPosition);
    }

    calcSize(ctx: CanvasRenderingContext2D, out: Vector2): void {
        this.#text.size(ctx, 1, out);
    }
}
