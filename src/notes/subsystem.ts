import { Camera } from "../camera";
import { ContextMenuConfig } from "../contextMenu";
import { RenderResults } from "../graphSubsystem";
import { InBox } from "../types/box";
import { Vector2 } from "../types/vector2";
import { DragHandle, FlowNote, FlowNoteConfig } from './note';


export type NoteAddedCallback = (addedNote: FlowNote) => void
export type NoteRemovedCallback = (noteRemoved: FlowNote) => void

export type NoteDragStartCallback = (nodeDragged: FlowNote) => void
export type NoteDragStopCallback = (nodeDragged: FlowNote) => void


export interface NoteSubsystemConfig {
    onNoteAdded?: NoteAddedCallback;
    onNoteRemoved?: NoteRemovedCallback;
    onNoteDragStop?: NoteDragStopCallback
    onNoteDragStart?: NoteDragStartCallback
    notes?: Array<FlowNoteConfig>
}

export class NoteSubsystem {

    #notes: Array<FlowNote>;

    #noteHovering: FlowNote | null;

    #noteSelected: FlowNote | null;

    #hoveringHandle: DragHandle;

    #onNoteAddedCallbacks: Array<NoteAddedCallback>;

    #onNoteRemovedCallbacks: Array<NoteRemovedCallback>;

    #onNoteDragStartCallbacks: Array<NoteDragStartCallback>;

    #onNoteDragStopCallbacks: Array<NoteDragStopCallback>;

    constructor(config?: NoteSubsystemConfig) {
        this.#hoveringHandle = DragHandle.None;
        this.#notes = [];
        this.#noteHovering = null;
        this.#noteSelected = null;

        // Callbacks
        this.#onNoteAddedCallbacks = new Array<NoteAddedCallback>();
        this.#onNoteRemovedCallbacks = new Array<NoteRemovedCallback>();
        this.#onNoteDragStartCallbacks = new Array<NoteDragStartCallback>();
        this.#onNoteDragStopCallbacks = new Array<NoteDragStopCallback>();

        if (config?.notes !== undefined) {
            for (let i = 0; i < config?.notes.length; i++) {
                this.addNote(new FlowNote(config?.notes[i]));
            }
        }

        // Add callback *after* we added all the initial notes
        if (config?.onNoteAdded !== undefined) {
            this.#onNoteAddedCallbacks.push(config?.onNoteAdded);
        }

        if (config?.onNoteDragStop !== undefined) {
            this.#onNoteDragStopCallbacks.push(config?.onNoteDragStop);
        }

        if (config?.onNoteDragStart !== undefined) {
            this.#onNoteDragStartCallbacks.push(config?.onNoteDragStart);
        }

        if (config?.onNoteRemoved !== undefined) {
            this.#onNoteRemovedCallbacks.push(config?.onNoteRemoved);
        }
    }

    addNote(note: FlowNote): void {
        if (note === null || note === undefined) {
            return;
        }

        this.#notes.push(note);
        for (let i = 0; i < this.#onNoteAddedCallbacks.length; i++) {
            this.#onNoteAddedCallbacks[i](note);
        }
    }

    public addNoteAddedListener(callback: NoteAddedCallback): void {
        if (callback === null || callback === undefined) {
            return;
        }
        this.#onNoteAddedCallbacks.push(callback);
    }

    public addNoteRemovedListener(callback: NoteRemovedCallback): void {
        if (callback === null || callback === undefined) {
            return;
        }
        this.#onNoteRemovedCallbacks.push(callback);
    }

    public addNoteDragStartListener(callback: NoteDragStartCallback): void {
        if (callback === null || callback === undefined) {
            return;
        }
        this.#onNoteDragStartCallbacks.push(callback);
    }

    public addNoteDragStopListener(callback: NoteDragStopCallback): void {
        if (callback === null || callback === undefined) {
            return;
        }
        this.#onNoteDragStopCallbacks.push(callback);
    }

    openContextMenu(ctx: CanvasRenderingContext2D, position: Vector2): ContextMenuConfig | null {
        const group = "node-flow-graph-note-menu";

        const result: ContextMenuConfig = {
            items: [
                {
                    name: "New Note",
                    group: group,
                    callback: () => {
                        this.addNote(new FlowNote({
                            text: "#Note\n\nRight-click this note and select \"edit note\" to put what you want here.",
                            width: 300,
                            position: position
                        }))
                    }
                }
            ],
            subMenus: [],
        }

        if (this.#noteHovering !== null) {
            const noteToReview = this.#noteHovering;
            result.items?.push(
                {
                    name: "Delete Note",
                    group: group,
                    callback: () => {
                        this.removeNote(noteToReview);
                    }
                },
                {
                    name: "Edit Note",
                    group: group,
                    callback: noteToReview.editContent.bind(noteToReview),
                },
            );

            if (!noteToReview.edittingLayout()) {
                result.items?.push({
                    name: "Unlock Note",
                    group: group,
                    callback: noteToReview.unlock.bind(noteToReview),
                })
            } else {
                result.items?.push({
                    name: "Lock Note",
                    group: group,
                    callback: noteToReview.lock.bind(noteToReview),
                })
            }
        }

        return result;
    }

    clickStart(mousePosition: Vector2, camera: Camera, ctrlKey: boolean): boolean {
        if (this.#noteHovering !== null && this.#noteHovering.edittingLayout()) {
            this.#noteSelected = this.#noteHovering;
            this.#noteSelected.selectHandle(this.#hoveringHandle);

            for (let i = 0; i < this.#onNoteDragStartCallbacks.length; i++) {
                this.#onNoteDragStartCallbacks[i](this.#noteSelected);
            }
            return true;
        }
        return false;
    }

    clickEnd(): void {
        if (this.#noteSelected !== null) {
            this.#noteSelected.selectHandle(DragHandle.None);
            for (let i = 0; i < this.#onNoteDragStopCallbacks.length; i++) {
                this.#onNoteDragStopCallbacks[i](this.#noteSelected);
            }
        }
        this.#noteSelected = null;
    }

    mouseDragEvent(delta: Vector2, scale: number): boolean {
        if (this.#noteSelected === null) {
            return false;
        }

        // Return early so we don't translate since we're moving a drag handle
        if (this.#noteSelected.handleSelected()) {
            return true;
        }

        this.#noteSelected.translate({
            x: delta.x * (1 / scale),
            y: delta.y * (1 / scale)
        });
        return true;
    }

    fileDrop(file: File): boolean {
        return false;
    }

    removeNote(note: FlowNote): void {
        const index = this.#notes.indexOf(note);
        if (index > -1) {
            const noteRemoved = this.#notes[index];
            this.#notes.splice(index, 1);

            for (let i = 0; i < this.#onNoteRemovedCallbacks.length; i++) {
                this.#onNoteRemovedCallbacks[i](noteRemoved)
            }
        } else {
            console.error("no note found to remove");
        }
    }

    render(ctx: CanvasRenderingContext2D, camera: Camera, mousePosition: Vector2 | undefined): RenderResults | undefined {
        this.#noteHovering = null;
        this.#hoveringHandle = DragHandle.None;

        // Set hovering to false on everything
        if (mousePosition) {
            for (let i = 0; i < this.#notes.length; i++) {
                this.#notes[i].setHovering(false);
                if (InBox(this.#notes[i].bounds(), mousePosition)) {
                    this.#noteHovering = this.#notes[i];
                }
            }
        }

        // The note on top of everything is the one that get's to be in a 
        // hover state
        if (this.#noteHovering != null) {
            this.#noteHovering.setHovering(true);
            if (mousePosition) {
                if (InBox(this.#noteHovering.leftResizeHandleBox(), mousePosition)) {
                    this.#hoveringHandle = DragHandle.Left;
                } else if (InBox(this.#noteHovering.rightResizeHandleBox(), mousePosition)) {
                    this.#hoveringHandle = DragHandle.Right;
                }
            }
        }

        for (let i = 0; i < this.#notes.length; i++) {
            this.#notes[i].render(ctx, camera, mousePosition);
        }
        return;
    }
}