import { CopyVector2, SubVector2, Vector2, Zero } from "./types/vector2";

export class MouseObserver {

    #clicked: boolean;

    #lastTouch: Vector2;

    #ele: HTMLElement

    #lastMousePosition: Vector2;

    #dragCallback: (delta: Vector2) => void
    #moveCallback: (position: Vector2) => void
    #clickStart: (position: Vector2, shiftOrCtrl: boolean) => void
    #clickStop: () => void
    #contextMenu: (position: Vector2) => void

    constructor(
        ele: HTMLElement,
        dragCallback: (delta: Vector2) => void,
        moveCallback: (position: Vector2) => void,
        clickStart: (position: Vector2, shiftOrCtrl: boolean) => void,
        clickStop: () => void,
        contextMenu: (position: Vector2) => void,
        fileDrop: (file: File) => void
    ) {
        this.#ele = ele;
        this.#dragCallback = dragCallback;
        this.#moveCallback = moveCallback;
        this.#clickStart = clickStart;
        this.#clickStop = clickStop;
        this.#contextMenu = contextMenu;

        this.#clicked = false;
        this.#lastTouch = Zero();
        this.#lastMousePosition = Zero();

        // Down
        ele.addEventListener('mousedown', this.#down.bind(this), false);
        ele.addEventListener('touchstart', this.#touchDown.bind(this), false);

        // Up
        ele.addEventListener('mouseup', this.#up.bind(this), false);
        ele.addEventListener('touchend', this.#up.bind(this), false);

        // Move
        ele.addEventListener('mousemove', this.#move.bind(this), false);
        ele.addEventListener('touchmove', this.#moveTouch.bind(this), false);

        ele.addEventListener('drop', (ev) => {
            ev.preventDefault();
            console.log(ev)

            if (ev.dataTransfer?.items) {
                // Use DataTransferItemList interface to access the file(s)
                [...ev.dataTransfer.items].forEach((item, i) => {
                    // If dropped items aren't files, reject them
                    if (item.kind === "file") {
                        const file = item.getAsFile();
                        if (file) {
                            fileDrop(file);
                            console.log(file)
                            console.log(`… file[${i}].name = ${file.name}`);
                        }
                    }
                });
            } else if (ev.dataTransfer) {
                // Use DataTransfer interface to access the file(s)
                [...ev.dataTransfer.files].forEach((file, i) => {
                    console.log(`… file[${i}].name = ${file.name}`);
                });
            }
        });

        ele.addEventListener('dragover', (ev) => {
            ev.preventDefault();
            this.#moveCallback(this.#mousePosition(ev));
            // console.log(ev)
        });

        // Context
        ele.addEventListener('contextmenu', (evt) => {
            contextMenu(this.#mousePosition(evt));
            evt.preventDefault()
        }, false);
    }

    #mousePosition(event: MouseEvent | DragEvent): Vector2 {
        var rect = this.#ele.getBoundingClientRect();
        return {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
        }
    }

    #move(event: MouseEvent): void {
        const pos = this.#mousePosition(event);

        if (this.#clicked) {
            const delta = Zero();
            SubVector2(delta, pos, this.#lastMousePosition);
            this.#dragCallback(delta)
        }

        this.#moveCallback(pos);
        CopyVector2(this.#lastMousePosition, pos);
    }

    #moveTouch(event: TouchEvent): void {
        const rect = this.#ele.getBoundingClientRect();
        const pos = {
            x: event.touches[0].clientX - rect.left,
            y: event.touches[0].clientY - rect.top
        }
        this.#moveCallback(pos);

        if (this.#clicked) {
            this.#dragCallback({
                x: pos.x - this.#lastTouch.x,
                y: pos.y - this.#lastTouch.y,
            });
        }

        CopyVector2(this.#lastTouch, pos);
    }

    #down(event: MouseEvent): void {
        // Only register left clicks
        if (event.button !== 0) {
            return;
        }
        this.#clicked = true;
        this.#clickStart(this.#mousePosition(event), event.ctrlKey || event.shiftKey);
    }

    #touchDown(event: TouchEvent) {
        this.#clicked = true;
        const rect = this.#ele.getBoundingClientRect();
        this.#lastTouch.x = event.touches[0].clientX - rect.left;
        this.#lastTouch.y = event.touches[0].clientY - rect.top;
        this.#clickStart(this.#lastTouch, false);
    }

    #up(event: MouseEvent): void {
        // Only register left clicks
        if (event.button !== 0) {
            return;
        }
        this.#clicked = false
        this.#clickStop();
    }
}