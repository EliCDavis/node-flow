import { CopyVector2, Distance, SubVector2, Vector2, Zero } from "./types/vector2";

const LONG_PRESS_MS = 500;
const LONG_PRESS_SLOP = 12;
const PINCH_SENSITIVITY = 50;
const SUPPRESS_MOUSE_MS = 600;

export class MouseObserver {

    #clicked: boolean;
    #lastTouch: Vector2;
    #ele: HTMLElement;
    #lastMousePosition: Vector2;

    #dragCallback: (delta: Vector2) => void;
    #moveCallback: (position: Vector2) => void;
    #clickStart: (position: Vector2, shiftOrCtrl: boolean) => void;
    #clickStop: () => void;
    #contextMenu: (position: Vector2) => void;
    #zoomCallback: (amount: number, anchor: Vector2) => void;

    #longPressTimer: ReturnType<typeof setTimeout> | null = null;
    #longPressOrigin: Vector2 = Zero();
    #longPressFired: boolean = false;
    #pinchDist: number = 0;
    #lastTouchAt: number = 0;

    constructor(
        ele: HTMLElement,
        dragCallback: (delta: Vector2) => void,
        moveCallback: (position: Vector2) => void,
        clickStart: (position: Vector2, shiftOrCtrl: boolean) => void,
        clickStop: () => void,
        contextMenu: (position: Vector2) => void,
        fileDrop: (file: File) => void,
        zoomCallback: (amount: number, anchor: Vector2) => void,
    ) {
        this.#ele = ele;
        this.#dragCallback = dragCallback;
        this.#moveCallback = moveCallback;
        this.#clickStart = clickStart;
        this.#clickStop = clickStop;
        this.#contextMenu = contextMenu;
        this.#zoomCallback = zoomCallback;

        this.#clicked = false;
        this.#lastTouch = Zero();
        this.#lastMousePosition = Zero();

        ele.style.touchAction = "none";

        ele.addEventListener("mousedown", this.#down.bind(this), false);
        ele.addEventListener("touchstart", this.#touchStart.bind(this), { passive: false });

        document.addEventListener("mouseup", this.#up.bind(this), false);
        document.addEventListener("touchend", this.#touchEnd.bind(this), false);
        document.addEventListener("touchcancel", this.#touchEnd.bind(this), false);

        ele.addEventListener("mousemove", this.#move.bind(this), false);
        ele.addEventListener("touchmove", this.#touchMove.bind(this), { passive: false });

        ele.addEventListener("wheel", this.#wheel.bind(this), { passive: false });

        ele.addEventListener("drop", (ev) => {
            ev.preventDefault();
            if (ev.dataTransfer?.items) {
                [...ev.dataTransfer.items].forEach((item, i) => {
                    if (item.kind === "file") {
                        const file = item.getAsFile();
                        if (file) {
                            fileDrop(file);
                        }
                    }
                });
            }
        });

        ele.addEventListener("dragover", (ev) => {
            ev.preventDefault();
            this.#moveCallback(this.#mousePos(ev));
        });

        ele.addEventListener("contextmenu", (evt) => {
            evt.preventDefault();
            // Touch uses long-press; ignore synthetic browser contextmenu after touch.
            if (Date.now() - this.#lastTouchAt < SUPPRESS_MOUSE_MS) {
                return;
            }
            this.#contextMenu(this.#mousePos(evt));
        }, false);
    }

    #mousePos(event: MouseEvent | DragEvent | WheelEvent): Vector2 {
        const rect = this.#ele.getBoundingClientRect();
        return {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top,
        };
    }

    #touchPos(touch: Touch): Vector2 {
        const rect = this.#ele.getBoundingClientRect();
        return {
            x: touch.clientX - rect.left,
            y: touch.clientY - rect.top,
        };
    }

    #fromTouch(): boolean {
        return Date.now() - this.#lastTouchAt < SUPPRESS_MOUSE_MS;
    }

    #clearLongPress(): void {
        if (this.#longPressTimer !== null) {
            clearTimeout(this.#longPressTimer);
            this.#longPressTimer = null;
        }
    }

    #wheel(event: WheelEvent): void {
        event.preventDefault();
        let dy = event.deltaY;
        if (event.deltaMode === WheelEvent.DOM_DELTA_LINE) {
            dy *= 16;
        } else if (event.deltaMode === WheelEvent.DOM_DELTA_PAGE) {
            dy *= this.#ele.clientHeight;
        }
        // Scroll up zooms in (matches Figma / Maps).
        const amount = -dy / 100;
        if (amount === 0) {
            return;
        }
        const anchor = this.#mousePos(event);
        this.#moveCallback(anchor);
        this.#zoomCallback(amount, anchor);
    }

    #move(event: MouseEvent): void {
        if (this.#fromTouch()) {
            return;
        }
        const pos = this.#mousePos(event);
        if (this.#clicked) {
            const delta = Zero();
            SubVector2(delta, pos, this.#lastMousePosition);
            this.#dragCallback(delta);
        }
        this.#moveCallback(pos);
        CopyVector2(this.#lastMousePosition, pos);
    }

    #down(event: MouseEvent): void {
        if (event.button !== 0 || this.#fromTouch()) {
            return;
        }
        this.#clicked = true;
        this.#clickStart(this.#mousePos(event), event.ctrlKey || event.shiftKey);
    }

    #up(event: MouseEvent): void {
        if (event.button !== 0 || this.#fromTouch()) {
            return;
        }
        this.#clicked = false;
        this.#clickStop();
    }

    #touchStart(event: TouchEvent): void {
        this.#lastTouchAt = Date.now();
        event.preventDefault();

        if (event.touches.length >= 2) {
            this.#clearLongPress();
            this.#clicked = false;
            this.#pinchDist = Distance(
                this.#touchPos(event.touches[0]),
                this.#touchPos(event.touches[1]),
            );
            return;
        }

        if (event.touches.length !== 1) {
            return;
        }

        const pos = this.#touchPos(event.touches[0]);
        CopyVector2(this.#longPressOrigin, pos);
        CopyVector2(this.#lastTouch, pos);
        this.#longPressFired = false;
        this.#pinchDist = 0;

        this.#clearLongPress();
        const x = pos.x;
        const y = pos.y;
        this.#longPressTimer = setTimeout(() => {
            this.#longPressTimer = null;
            this.#longPressFired = true;
            this.#clicked = false;
            this.#clickStop();
            this.#contextMenu({ x, y });
        }, LONG_PRESS_MS);

        this.#clicked = true;
        this.#moveCallback(pos);
        this.#clickStart(pos, false);
    }

    #touchMove(event: TouchEvent): void {
        this.#lastTouchAt = Date.now();
        event.preventDefault();

        if (event.touches.length >= 2) {
            this.#clearLongPress();
            this.#clicked = false;
            const a = this.#touchPos(event.touches[0]);
            const b = this.#touchPos(event.touches[1]);
            const dist = Distance(a, b);
            const anchor = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
            if (this.#pinchDist > 0) {
                this.#moveCallback(anchor);
                this.#zoomCallback((dist - this.#pinchDist) / PINCH_SENSITIVITY, anchor);
            }
            this.#pinchDist = dist;
            return;
        }

        if (event.touches.length !== 1) {
            return;
        }

        const pos = this.#touchPos(event.touches[0]);
        if (this.#longPressTimer !== null && Distance(pos, this.#longPressOrigin) > LONG_PRESS_SLOP) {
            this.#clearLongPress();
        }

        this.#moveCallback(pos);
        if (this.#clicked && !this.#longPressFired) {
            this.#dragCallback({
                x: pos.x - this.#lastTouch.x,
                y: pos.y - this.#lastTouch.y,
            });
        }
        CopyVector2(this.#lastTouch, pos);
    }

    #touchEnd(event: TouchEvent): void {
        this.#lastTouchAt = Date.now();
        this.#clearLongPress();

        if (event.touches.length >= 1) {
            this.#pinchDist = 0;
            return;
        }

        this.#pinchDist = 0;
        this.#clicked = false;
        if (!this.#longPressFired) {
            this.#clickStop();
        }
        this.#longPressFired = false;
    }
}
