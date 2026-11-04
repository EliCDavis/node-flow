type Redraw = () => void;

const subscribers = new Set<Redraw>();
let frameQueued = false;
let continuous = 0;

const canSchedule = (): boolean =>
    typeof requestAnimationFrame === "function";

export function onRenderRequested(redraw: Redraw): () => void {
    subscribers.add(redraw);
    return () => {
        subscribers.delete(redraw);
    };
}


export function requestRender(): void {
    if (frameQueued || !canSchedule()) {
        return;
    }

    frameQueued = true;
    requestAnimationFrame(() => {
        frameQueued = false;
        subscribers.forEach((redraw) => redraw());

        // Something asked to be redrawn every frame, so keep the loop
        // alive by asking again on its behalf.
        if (continuous > 0) {
            requestRender();
        }
    });
}


export function renderContinuously(): () => void {
    continuous++;
    requestRender();

    let released = false;
    return () => {
        if (released) {
            return;
        }
        released = true;
        continuous--;
    };
}
