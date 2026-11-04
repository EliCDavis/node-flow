import * as assert from 'assert';
import { Camera } from '../src/camera';
import { Minimap } from '../src/minimap';
import { FlowNode } from '../src/node';
import { Theme } from '../src/theme';

/** Records the fill and stroke colors a render asked for, in order. */
function recordingContext(): { ctx: any, fills: Array<string>, strokes: Array<string> } {
    const fills: Array<string> = [];
    const strokes: Array<string> = [];

    const ctx: any = {
        lineWidth: 1,
        font: "",
        textAlign: "left",
        textBaseline: "top",
        set fillStyle(value: string) { fills.push(value); },
        get fillStyle() { return fills[fills.length - 1]; },
        set strokeStyle(value: string) { strokes.push(value); },
        get strokeStyle() { return strokes[strokes.length - 1]; },
        measureText: () => ({ width: 40 }),
        beginPath: () => { },
        closePath: () => { },
        roundRect: () => { },
        rect: () => { },
        moveTo: () => { },
        lineTo: () => { },
        arc: () => { },
        bezierCurveTo: () => { },
        quadraticCurveTo: () => { },
        fill: () => { },
        stroke: () => { },
        fillRect: () => { },
        strokeRect: () => { },
        fillText: () => { },
        save: () => { },
        restore: () => { },
        translate: () => { },
        scale: () => { },
        setLineDash: () => { },
        clip: () => { },
        createLinearGradient: () => ({ addColorStop: () => { } }),
        drawImage: () => { },
    };

    return { ctx, fills, strokes };
}

function render(minimap: Minimap) {
    const { ctx, fills, strokes } = recordingContext();
    const canvas: any = { width: 800, height: 600 };
    const node = new FlowNode({ title: "node", position: { x: 0, y: 0 } });
    minimap.render(ctx, canvas, new Camera(), [node]);
    return { fills, strokes };
}

describe('Minimap theming', () => {
    const original = { ...Theme.Minimap };

    afterEach(() => {
        Object.assign(Theme.Minimap, original);
    });

    it('draws with the colors the theme carries', () => {
        const minimap = new Minimap({ enabled: true });

        const { fills, strokes } = render(minimap);

        assert.ok(fills.includes(Theme.Minimap.BackgroundColor), "panel uses the theme background");
        assert.ok(fills.includes(Theme.Minimap.NodeColor), "nodes use the theme node color");
        assert.ok(fills.includes(Theme.Minimap.ViewportColor), "viewport uses the theme viewport color");
        assert.ok(strokes.includes(Theme.Minimap.BorderColor), "border uses the theme border color");
    });

    // The whole point of moving these onto Theme: retheming the app restyles a
    // minimap that is already on screen, without rebuilding it.
    it('follows a theme change made after it was built', () => {
        const minimap = new Minimap({ enabled: true });
        render(minimap);

        Theme.Minimap.BackgroundColor = "#ff0000";
        Theme.Minimap.NodeColor = "#00ff00";
        Theme.Minimap.ViewportColor = "#0000ff";
        Theme.Minimap.BorderColor = "#ffff00";

        const { fills, strokes } = render(minimap);

        assert.ok(fills.includes("#ff0000"));
        assert.ok(fills.includes("#00ff00"));
        assert.ok(fills.includes("#0000ff"));
        assert.ok(strokes.includes("#ffff00"));
    });

    it('lets one minimap override the theme without changing it for the rest', () => {
        const minimap = new Minimap({ enabled: true, backgroundColor: "#123456" });

        const { fills } = render(minimap);

        assert.ok(fills.includes("#123456"), "the override wins");
        assert.ok(!fills.includes(Theme.Minimap.BackgroundColor), "the theme value is not also drawn");
        assert.ok(fills.includes(Theme.Minimap.NodeColor), "ports left unset still follow the theme");
    });
});
