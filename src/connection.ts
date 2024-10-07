import { FlowNode } from "./node";
import { Port } from "./port";
import { BoxCenter, InBox } from "./types/box";
import { Vector2 } from "./types/vector2";

export interface ConnectionRendererParams {
    ctx: CanvasRenderingContext2D;
    start: Vector2;
    end: Vector2;
    graphScale: number;
    mouseOver: boolean;

    inNode: FlowNode | null;
    inPort: Port | null;
    outNode: FlowNode | null;
    outPort: Port | null;
}

export type ConnectionRenderer = (params: ConnectionRendererParams) => void

export function DefaultConnectionRenderer(connectionSize: number, connectionColor: string | undefined, mouseOverSize: number, mouseOverColor: string | undefined): ConnectionRenderer {
    return (params: ConnectionRendererParams) => {

        let color = "#00FF00";
        if (params.outPort !== null) {
            color = params.outPort.filledStyleColor()
        } else if (params.inPort !== null) {
            color = params.inPort.filledStyleColor()
        }

        let lineSize = connectionSize * params.graphScale;
        if (connectionColor !== undefined) {
            color = connectionColor;
        }

        if (params.mouseOver  || params.inNode?.selected() || params.outNode?.selected()) {
            lineSize = mouseOverSize * params.graphScale;
            params.ctx.shadowBlur = 25 * params.graphScale;

            if (mouseOverColor !== undefined) {
                color = mouseOverColor;
            }

            params.ctx.shadowColor = color;
        }

        params.ctx.strokeStyle = color;
        params.ctx.lineWidth = lineSize;

        // Draw
        params.ctx.beginPath();
        params.ctx.moveTo(params.start.x, params.start.y);
        const midX = (params.start.x + params.end.x) / 2;
        params.ctx.bezierCurveTo(midX, params.start.y, midX, params.end.y, params.end.x, params.end.y);
        params.ctx.stroke();
        params.ctx.shadowBlur = 0;
    }
}

export class Connection {

    // Variables for holding temp data, preventing object allocations each
    // frame
    #inPos: Vector2;
    #outPos: Vector2;

    #inNode: FlowNode | null;
    #inNodePortIndex: number;
    #outNode: FlowNode | null;
    #outNodePortIndex: number;
    #renderer: ConnectionRenderer;

    constructor(
        inNode: FlowNode | null,
        inNodePortIndex: number,
        outNode: FlowNode | null,
        outNodePortIndex: number,
        renderer: ConnectionRenderer,
    ) {

        this.#inNode = inNode;
        this.#inNodePortIndex = inNodePortIndex;
        this.#outNode = outNode;
        this.#outNodePortIndex = outNodePortIndex;
        this.#renderer = renderer;
        
        this.#inPos = { x: 0, y: 0 };
        this.#outPos = { x: 0, y: 0 };

        if (inNode !== null) {
            inNode.inputPort(this.#inNodePortIndex).addConnection(this);
        }

        if (outNode !== null) {
            outNode.outputPort(this.#outNodePortIndex).addConnection(this);
        }
    }

    render(ctx: CanvasRenderingContext2D, graphScale: number, mouseOver: boolean, mousePosition: Vector2 | undefined): void {

        // Not sure what to do here? Maybe we should throw an error in the 
        // future?
        if (this.#inNode === null && this.#outNode === null) {
            return;
        }

        if (this.#inNode !== null) {
            const inPortBox = this.#inNode.inputPortPosition(this.#inNodePortIndex)
            if (inPortBox === undefined) {
                return;
            }
            BoxCenter(inPortBox, this.#inPos);
        } else if (mousePosition !== undefined) {
            this.#inPos.x = mousePosition.x;
            this.#inPos.y = mousePosition.y;
        } else {
            return;
        }

        if (this.#outNode !== null) {
            const outPortBox = this.#outNode.outputPortPosition(this.#outNodePortIndex);
            if (outPortBox === undefined) {
                return;
            }
            BoxCenter(outPortBox, this.#outPos);
        } else if (mousePosition !== undefined) {
            this.#outPos.x = mousePosition.x;
            this.#outPos.y = mousePosition.y;
        } else {
            return;
        }

        this.#renderer({
            ctx: ctx,
            start: this.#inPos,
            end: this.#outPos,
            graphScale: graphScale,
            mouseOver: mouseOver,

            inPort: this.inPort(),
            inNode: this.#inNode,
            outPort: this.outPort(),
            outNode: this.#outNode,
        });
    }

    inNode(): FlowNode | null {
        return this.#inNode;
    }

    outNode(): FlowNode | null {
        return this.#outNode;
    }

    clearPort(mousePosition: Vector2): void {
        if (this.#inNode !== null) {
            const inPortBox = this.#inNode.inputPortPosition(this.#inNodePortIndex)
            if (inPortBox !== undefined && InBox(inPortBox, mousePosition)) {
                this.clearInput();
            }
        }

        if (this.#outNode !== null) {
            const outPortBox = this.#outNode.outputPortPosition(this.#outNodePortIndex);
            if (outPortBox !== undefined && InBox(outPortBox, mousePosition)) {
                this.clearOutput();
            }
        }
    }

    clearPorts(): void {
        this.clearInput();
        this.clearOutput();
    }

    setInput(node: FlowNode, portIndex: number): void {
        this.#inNode = node;
        this.#inNodePortIndex = portIndex;
        this.#inNode.inputPort(portIndex).addConnection(this);
    }

    setOutput(node: FlowNode, portIndex: number): void {
        this.#outNode = node;
        this.#outNodePortIndex = portIndex;
        this.#outNode.outputPort(portIndex).addConnection(this);
    }

    clearInput() {
        this.#inNode?.inputPort(this.#inNodePortIndex).clearConnection(this);
        this.#inNode = null;
        this.#inNodePortIndex = -1;
    }

    clearOutput() {
        this.#outNode?.outputPort(this.#outNodePortIndex).clearConnection(this);
        this.#outNode = null;
        this.#outNodePortIndex = -1;
    }

    mouseOverPort(mousePosition: Vector2): Port | null {
        if (this.#inNode !== null) {
            const inPortBox = this.#inNode.inputPortPosition(this.#inNodePortIndex)
            if (inPortBox !== undefined && InBox(inPortBox, mousePosition)) {
                return this.#inNode.inputPort(this.#inNodePortIndex)
            }
        }

        if (this.#outNode !== null) {
            const outPortBox = this.#outNode.outputPortPosition(this.#outNodePortIndex);
            if (outPortBox !== undefined && InBox(outPortBox, mousePosition)) {
                return this.#outNode.outputPort(this.#outNodePortIndex)
            }
        }

        return null;
    }

    outPort(): Port | null {
        if (this.#outNode === null) {
            return null;
        }
        return this.#outNode.outputPort(this.#outNodePortIndex);
    }

    inPort(): Port | null {
        if (this.#inNode === null) {
            return null;
        }
        return this.#inNode.inputPort(this.#inNodePortIndex);
    }

    referencesNode(node: FlowNode): boolean {
        if (this.#inNode === node) {
            return true;
        }

        if (this.#outNode === node) {
            return true;
        }

        return false;
    }
}