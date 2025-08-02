import { Vector2, Zero } from "./types/vector2";

export class Camera {

    zoom: number;

    position: Vector2;

    constructor() {
        this.zoom = 1;
        this.position = Zero();
    }

    screenSpaceToGraphSpace(screenPosition: Vector2, out: Vector2): void {
        const scale = this.zoom;
        out.x = (screenPosition.x / scale) - (this.position.x / scale);
        out.y = (screenPosition.y / scale) - (this.position.y / scale);
    }

    graphSpaceToScreenSpace(graphPosition: Vector2, out: Vector2): void {
        out.x = this.position.x + (graphPosition.x * this.zoom);
        out.y = this.position.y + (graphPosition.y * this.zoom);
    }

    reset(): void {
        this.zoom = 1;
        this.position.x = 0;
        this.position.y = 0;
    }
}