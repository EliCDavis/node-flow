import { Box } from "../types/box";
import { CopyVector2, Vector2 } from "../types/vector2";

const margin = 15;

export interface ImageWidgetConfig {
    image?: string;
    maxWidth?: number
    maxHeight?: number
    blob?: Blob;
}

/**
 *   constructor(lightNode, nodeManager, id, parameterData, app) {
        this.lightNode = lightNode;
        this.id = id;
        this.app = app;
        this.lightNode.title = parameterData.name;

        this.lightNode.onDropFile = (file) => {
            // console.log(file)
            var reader = new FileReader();
            reader.onload = (evt) => {
                console.log(evt.target.result)
                nodeManager.nodeParameterChanged({
                    id: id,
                    data: evt.target.result,
                    binary: true
                });
            }
            reader.readAsArrayBuffer(file);

            const url = URL.createObjectURL(file);
            // this.loadImage(this._url, function (img) {
            //     that.size[1] = (img.height / img.width) * that.size[0];
            // });
            this.loadImgFromURL(url);
        }
    }

    loadImgFromURL(url) {
        const img = document.createElement("img");
        img.src = url;
        img.onload = () => {
            // if (callback) {
            // callback(this);
            // }
            // console.log("Image loaded, size: " + img.width + "x" + img.height);
            // this.dirty = true;
            // that.boxcolor = "#9F9";f
            // that.setDirtyCanvas(true);
            this.lightNode.widgets[0].image = img
            this.lightNode.setSize(this.lightNode.computeSize());
        };
        img.onerror = () => {
            console.log("error loading the image:" + url);
        }
    }

    update(parameterData) {
        console.log("image parameter", parameterData)
        const curVal = parameterData.currentValue;
        this.app.RequestManager.getParameterValue(this.id, (response) => {
            const url = URL.createObjectURL(response);
            this.loadImgFromURL(url)
        })
    }
 */

export class ImageWidget {

    #url: string | undefined;

    #image: HTMLImageElement | undefined;

    #maxWidth: number;

    #maxHeight: number;

    constructor(config?: ImageWidgetConfig) {
        this.#maxWidth = config?.maxWidth === undefined ? 150 : config?.maxWidth;
        this.#maxHeight = config?.maxHeight === undefined ? 150 : config?.maxHeight;
        if (config?.image) {
            this.SetUrl(config?.image);
        } else if (config?.blob) {
            this.SetBlob(config?.blob);
        }
    }

    SetBlob(blob: Blob) {
        const urlCreator = window.URL || window.webkitURL;
        const imageUrl = urlCreator.createObjectURL(blob);
        this.SetUrl(imageUrl);
    }

    SetUrl(url: string) {
        this.#image = undefined;
        this.#url = url;

        const img = document.createElement("img");
        img.src = url;
        img.onload = () => {
            this.#image = img;
        };
        img.onerror = (event) => {
            console.log("error loading image:", url, event);
        }
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

    ClickStart(): void {
    }

    ClickEnd(): void {
    }

    Draw(ctx: CanvasRenderingContext2D, position: Vector2, scale: number, mousePosition: Vector2 | undefined): Box {
        const size = this.Size();
        const box: Box = {
            Position: { x: 0, y: 0 },
            Size: {
                x: size.x * scale,
                y: size.y * scale,
            }
        }
        CopyVector2(box.Position, position);

        if (!this.#image) {
            return box;
        }

        ctx.drawImage(
            this.#image,
            position.x,
            position.y,
            box.Size.x,
            box.Size.y
        );
        return box;
    }
}