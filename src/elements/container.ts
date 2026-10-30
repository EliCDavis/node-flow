import { ScaleVector, Vector2 } from '../types/vector2';
import { RenderElementBase, RenderElementBaseStyling } from "./base";
import { IRenderElement } from "./interfaces";


interface ContainerRenderElementConfig extends RenderElementBaseStyling {

}

export enum LayoutDirection {
    Column = "column",
    Row = "row"
}

export enum AlignItems {
    Stretch = "stretch",
    Start = "start",
    Center = "center",
    End = "end"
}

export class ContainerRenderElement extends RenderElementBase {

    #elements: Array<IRenderElement>;

    #layout: LayoutDirection;

    #alignment: AlignItems;

    constructor(elements: Array<IRenderElement>, config?: ContainerRenderElementConfig) {
        super(config);
        this.#elements = elements;
        this.#layout = LayoutDirection.Column;
        this.#alignment = AlignItems.Stretch;
    }

    calcSize(ctx: CanvasRenderingContext2D, out: Vector2, limitations: Vector2): void {
        out.x = 0;
        out.y = 0;

        const eleSize = { x: 0, y: 0 };

        switch (this.#layout) {
            case LayoutDirection.Column:
                for (let i = 0; i < this.#elements.length; i++) {
                    this.#elements[i].size(ctx, eleSize);
                    out.x = Math.max(out.x, eleSize.x);
                    out.y += eleSize.y;
                }
                break;

            case LayoutDirection.Row:
                for (let i = 0; i < this.#elements.length; i++) {
                    this.#elements[i].size(ctx, eleSize);
                    out.y = Math.max(out.y, eleSize.y);
                    out.x += eleSize.x;
                }
                break;

            default:
                throw new Error("unknown layout: " + this.#layout);
        }

    }

    doRender(ctx: CanvasRenderingContext2D, position: Vector2, graphScale: number, scaledFillableSpace: Vector2): void {
        // const size = { x: 0, y: 0 };
        // const limitations = { x: 0, y: 0 };
        // this.limitations(limitations)
        // this.calcSize(ctx, size, limitations);
        switch (this.#layout) {
            case LayoutDirection.Column:
                this.#renderColumn(ctx, position, graphScale, scaledFillableSpace);
                break;

            default:
                throw new Error("unimplemented layout direction: " + this.#layout);
        }
    }

    #renderColumn(ctx: CanvasRenderingContext2D, position: Vector2, graphScale: number, scaledFillableSpace: Vector2): void {
        const currnetPos = { x: position.x, y: position.y };
        const scaledEleSize = { x: 0, y: 0 };
        for (let i = 0; i < this.#elements.length; i++) {
            const ele = this.#elements[i];

            ele.size(ctx, scaledEleSize);
            ScaleVector(scaledEleSize, graphScale);

            switch (this.#alignment) {

                case AlignItems.Stretch:
                    currnetPos.x = position.x;
                    scaledEleSize.x = scaledFillableSpace.x;
                    break;

                // I'm not sure if this is even needed, I feel like this should
                // already be the case.
                case AlignItems.Start: //garney flarney <---- silly goose steenky feet
                    currnetPos.x = position.x;
                    break

                case AlignItems.End:
                    currnetPos.x = scaledFillableSpace.x - scaledEleSize.x
                    break;

                case AlignItems.Center:
                    currnetPos.x = scaledFillableSpace.x - (scaledEleSize.x / 2)
                    break;

                default:
                    throw new Error("unimplmeneted alignment: " + this.#alignment)
            }

            ele.render(ctx, currnetPos, graphScale, scaledEleSize);
            currnetPos.y += scaledEleSize.y;
        }
    }
}