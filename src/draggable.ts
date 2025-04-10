import { Box } from "./types/box";
import { Vector2 } from "./types/vector2";

export interface Draggable {
    Components(): Array<DraggableComponent>;
}

export interface DraggableComponent {
    Bounds(): Box;
    ClickStart(mousePosition: Vector2): void;
    ClickEnd(): void;
    MouseMove(mousePosition: Vector2): void;
}