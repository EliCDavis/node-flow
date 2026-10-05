import { Camera } from "../camera";
import { ContextMenuConfig } from "../contextMenu";
import { RenderResults } from "../graphSubsystem";
import { List } from "../types/list";
import { Vector2 } from "../types/vector2";

type RenderLambda = () => void


/**
 * Generic subsystem meant for other sybsystems to pass whatever to to render 
 * at a certain time.
 * 
 * Initial inspriation is for a subsytem to submit something to render on top 
 * of all other subsystems.
 */
export class PassSubsystem {

    #queue: List<RenderLambda>

    constructor() {
        this.#queue = new List<RenderLambda>();
    }

    queue(lambda: RenderLambda): void {
        if(!lambda) {
            return;
        }
        this.#queue.Push(lambda);
    }

    render(ctx: CanvasRenderingContext2D, camera: Camera, mousePosition: Vector2 | undefined): RenderResults | undefined {
        for (let i = 0; i < this.#queue.Count(); i++) {
            this.#queue.At(i)();
        }
        this.#queue.Clear();
        return;
    }

    openContextMenu(ctx: CanvasRenderingContext2D, position: Vector2): ContextMenuConfig | null {
        // Left intentionally blank
        return null;
    }

    clickStart(mousePosition: Vector2, camera: Camera, ctrlKey: boolean): boolean {
        // Left intentionally blank
        return false;
    }

    mouseDragEvent(delta: Vector2, scale: number): boolean {
        // Left intentionally blank
        return false;
    }

    fileDrop(file: File): boolean {
        // Left intentionally blank
        return false;
    }

    clickEnd(): void {
        // Left intentionally blank
    }

}