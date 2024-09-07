import { ContextMenuConfig } from "./contextMenu";
import { CursorStyle } from "./styles/cursor";
import { Vector2 } from "./types/vector2";

export interface RenderResults {
    cursorStyle?: CursorStyle;
}

export interface GraphSubsystem {

    render(ctx: CanvasRenderingContext2D, scale: number, position: Vector2, mousePosition: Vector2 | undefined): RenderResults | undefined;

    openContextMenu(position: Vector2): ContextMenuConfig | null;

    /**
     * Event for when the graph is clicked. 
     * 
     * Returns whether or not the subsystem had one of it's elements clicked on
     * 
     * @param mousePosition Where the mouse is on the graph
     * @param ctrlKey Whether or not the ctrl key is pressed
     */
    clickStart(mousePosition: Vector2, ctrlKey: boolean): boolean;

    mouseDragEvent(delta: Vector2, scale: number): boolean;

    clickEnd(): void;
}
