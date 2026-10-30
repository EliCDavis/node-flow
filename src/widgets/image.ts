import { requestRender } from "../render_scheduler";
import { CursorStyle } from "../styles/cursor";
import { Box } from "../types/box";
import { Vector2 } from "../types/vector2";
import { WidgetBase } from "./widget";

export interface ImageWidgetConfig {
    image?: string;
    maxWidth?: number
    maxHeight?: number
    blob?: Blob;
}

export class ImageWidget extends WidgetBase {

    #url: string | undefined;

    #ownedUrl: string | undefined;

    #image: HTMLImageElement | undefined;

    #maxWidth: number;

    #maxHeight: number;

    constructor(config?: ImageWidgetConfig) {
        super();
        this.#maxWidth = config?.maxWidth === undefined ? 150 : config?.maxWidth;
        this.#maxHeight = config?.maxHeight === undefined ? 150 : config?.maxHeight;
        if (config?.image) {
            this.SetUrl(config?.image);
        } else if (config?.blob) {
            this.SetBlob(config?.blob);
        }
    }

    SetBlob(blob: Blob) {
        const url = URL.createObjectURL(blob);
        this.SetUrl(url);
        this.#ownedUrl = url;
    }

    SetUrl(url: string) {
        if (this.#ownedUrl !== undefined) {
            URL.revokeObjectURL(this.#ownedUrl);
            this.#ownedUrl = undefined;
        }
        this.#image = undefined;
        this.#url = url;

        const img = document.createElement("img");
        img.src = url;
        img.onload = () => {
            if (this.#url !== url) {
                return;
            }
            this.#image = img;
            requestRender();
        };
        img.onerror = (event) => {
            console.log("error loading image:", url, event);
        }
    }

    Cursor(): CursorStyle {
        return CursorStyle.Default;
    }

    Size(): Vector2 {
        if (this.#image === undefined) {
            return { "x": 0, "y": 0 }
        }

        let adjust = 1;
        if (this.#image.width > this.#maxWidth) {
            adjust = this.#maxWidth / this.#image.width
        }

        if (this.#image.height > this.#maxHeight) {
            let heightAdjust = this.#maxHeight / this.#image.height
            if (heightAdjust < adjust) {
                adjust = heightAdjust;
            }
        }

        return {
            "x": adjust * this.#image.width,
            "y": adjust * this.#image.height
        }
    }

    protected render(ctx: CanvasRenderingContext2D, box: Box, scale: number): void {
        if (!this.#image) {
            return;
        }
        const size = this.Size();
        const w = size.x * scale;
        const h = size.y * scale;
        ctx.drawImage(
            this.#image,
            box.Position.x + ((box.Size.x - w) / 2),
            box.Position.y,
            w,
            h
        );
    }
}
