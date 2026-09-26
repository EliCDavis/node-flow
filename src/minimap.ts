import { Camera } from "./camera";
import { FlowNode } from "./node";
import { Theme } from "./theme";
import { Box, InBox } from "./types/box";
import { Vector2 } from "./types/vector2";

export interface MinimapConfig {
    enabled?: boolean;
    width?: number;
    height?: number;
    margin?: number;

    /** Overrides Theme.Minimap.BackgroundColor for this minimap alone. */
    backgroundColor?: string;

    /** Overrides Theme.Minimap.BorderColor for this minimap alone. */
    borderColor?: string;

    /** Overrides Theme.Minimap.NodeColor for this minimap alone. */
    nodeColor?: string;

    /** Overrides Theme.Minimap.ViewportColor for this minimap alone. */
    viewportColor?: string;
}

export class Minimap {

    #enabled: boolean;

    #width: number;

    #height: number;

    #margin: number;

    #backgroundColor?: string;

    #borderColor?: string;

    #nodeColor?: string;

    #viewportColor?: string;

    #box: Box = { Position: { x: 0, y: 0 }, Size: { x: 0, y: 0 } };

    #scale: number = 1;

    #originX: number = 0;

    #originY: number = 0;

    // The padding the last frame was laid out with, so a click maps back
    // through the same geometry it was drawn with.
    #padding: number = Theme.Minimap.Padding;

    #drawn: boolean = false;

    constructor(config?: MinimapConfig) {
        this.#enabled = config?.enabled === true;
        this.#width = config?.width === undefined ? 200 : config.width;
        this.#height = config?.height === undefined ? 150 : config.height;
        this.#margin = config?.margin === undefined ? 16 : config.margin;
        this.#backgroundColor = config?.backgroundColor;
        this.#borderColor = config?.borderColor;
        this.#nodeColor = config?.nodeColor;
        this.#viewportColor = config?.viewportColor;
    }

    enabled(): boolean {
        return this.#enabled;
    }

    setEnabled(enabled: boolean): void {
        this.#enabled = enabled;
        this.#drawn = false;
    }

    contains(position: Vector2): boolean {
        return this.#enabled && this.#drawn && InBox(this.#box, position);
    }

    graphPositionOf(position: Vector2, out: Vector2): void {
        out.x = (position.x - this.#box.Position.x - this.#padding) / this.#scale + this.#originX;
        out.y = (position.y - this.#box.Position.y - this.#padding) / this.#scale + this.#originY;
    }

    render(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, camera: Camera, nodes: Array<FlowNode>): void {
        if (!this.#enabled) {
            this.#drawn = false;
            return;
        }

        // Bounds are taken with a fresh camera so they come back in graph
        // space rather than wherever the real camera happens to be looking.
        const flat = new Camera();
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

        const boxes: Array<Box> = [];
        for (let i = 0; i < nodes.length; i++) {
            const bounds = nodes[i].calculateBounds(ctx, flat);
            boxes.push(bounds);
            minX = Math.min(minX, bounds.Position.x);
            minY = Math.min(minY, bounds.Position.y);
            maxX = Math.max(maxX, bounds.Position.x + bounds.Size.x);
            maxY = Math.max(maxY, bounds.Position.y + bounds.Size.y);
        }

        // What the camera can currently see, so the graph never scales out
        // from under the viewport box.
        const topLeft: Vector2 = { x: 0, y: 0 };
        const bottomRight: Vector2 = { x: 0, y: 0 };
        camera.screenSpaceToGraphSpace({ x: 0, y: 0 }, topLeft);
        camera.screenSpaceToGraphSpace({ x: canvas.width, y: canvas.height }, bottomRight);

        minX = Math.min(minX, topLeft.x);
        minY = Math.min(minY, topLeft.y);
        maxX = Math.max(maxX, bottomRight.x);
        maxY = Math.max(maxY, bottomRight.y);

        if (!isFinite(minX) || maxX <= minX || maxY <= minY) {
            this.#drawn = false;
            return;
        }

        this.#box.Size.x = this.#width;
        this.#box.Size.y = this.#height;
        this.#box.Position.x = canvas.width - this.#width - this.#margin;
        this.#box.Position.y = canvas.height - this.#height - this.#margin;

        this.#padding = Theme.Minimap.Padding;

        const usableWidth = this.#width - (this.#padding * 2);
        const usableHeight = this.#height - (this.#padding * 2);
        this.#scale = Math.min(usableWidth / (maxX - minX), usableHeight / (maxY - minY));
        this.#originX = minX;
        this.#originY = minY;

        const left = this.#box.Position.x + this.#padding;
        const top = this.#box.Position.y + this.#padding;
        const toMapX = (x: number) => left + ((x - minX) * this.#scale);
        const toMapY = (y: number) => top + ((y - minY) * this.#scale);

        ctx.fillStyle = this.#backgroundColor ?? Theme.Minimap.BackgroundColor;
        ctx.strokeStyle = this.#borderColor ?? Theme.Minimap.BorderColor;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(
            this.#box.Position.x,
            this.#box.Position.y,
            this.#width,
            this.#height,
            Theme.Minimap.BorderRadius,
        );
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = this.#nodeColor ?? Theme.Minimap.NodeColor;
        for (let i = 0; i < boxes.length; i++) {
            const b = boxes[i];
            ctx.fillRect(
                toMapX(b.Position.x),
                toMapY(b.Position.y),
                Math.max(1, b.Size.x * this.#scale),
                Math.max(1, b.Size.y * this.#scale),
            );
        }

        ctx.fillStyle = this.#viewportColor ?? Theme.Minimap.ViewportColor;
        ctx.fillRect(
            toMapX(topLeft.x),
            toMapY(topLeft.y),
            Math.max(1, (bottomRight.x - topLeft.x) * this.#scale),
            Math.max(1, (bottomRight.y - topLeft.y) * this.#scale),
        );

        this.#drawn = true;
    }
}
