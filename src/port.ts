import { Camera } from "./camera";
import { Connection } from "./connection";
import { FlowNode } from "./node";
import { TextAlign } from "./styles/canvasTextAlign";
import { Box, BoxIntersection, InBox } from "./types/box";
import { Vector2 } from "./types/vector2";
import { Color, HSV, HSV2RGB, RgbToHex } from "./utils/color";

export enum PortType {
    Input = "INPUT",
    Output = "OUTPUT",
    InputArray = "INPUTARRAY",
}

export interface PortStyle {
    size?: number;
    fillColor?: string;
    borderColor?: string;
    borderSize?: number;
}

type ConnectionChangeCallback = (connection: Connection, port: Port, portType: PortType, node: FlowNode) => void

export interface PortConfig {
    name?: string;
    type?: string;
    emptyStyle?: PortStyle;
    filledStyle?: PortStyle;
    onConnectionAdded?: ConnectionChangeCallback;
    onConnectionRemoved?: ConnectionChangeCallback;
};

// Calculate a color hash for an arbirary type
function fallbackColor(type: string, s: number): string {
    let value = 0;
    for (var i = 0; i < type.length; i++) {
        value += type.charCodeAt(i) * (i + 1);
    }

    const mod = 24;
    value = Math.round(value) % mod;

    const hsv: HSV = { h: (value / (mod - 1)) * 360, s: s, v: 1 };
    const color: Color = { r: 0, g: 0, b: 0 };
    HSV2RGB(hsv, color);
    return RgbToHex(color);
}

export class Port {

    #node: FlowNode;

    #displayName: string;

    #emptyStyle: PortStyle;

    #filledStyle: PortStyle;

    #connections: Array<Connection>;

    #portType: PortType

    #dataType: string;

    #onConnectionAdded: Array<ConnectionChangeCallback>;

    #onConnectionRemoved: Array<ConnectionChangeCallback>;;

    constructor(node: FlowNode, portType: PortType, config?: PortConfig) {
        this.#node = node;
        this.#connections = new Array<Connection>();
        this.#portType = portType;
        this.#displayName = config?.name === undefined ? "Port" : config?.name;
        this.#dataType = config?.type === undefined ? "" : config?.type;

        this.#emptyStyle = {
            borderColor: config?.emptyStyle?.borderColor === undefined ? "#1c1c1c" : config.emptyStyle?.borderColor,
            fillColor: config?.emptyStyle?.fillColor === undefined ? fallbackColor(this.#dataType, 0.3) : config.emptyStyle?.fillColor,
            borderSize: config?.emptyStyle?.borderSize === undefined ? 1 : config.emptyStyle?.borderSize,
            size: config?.emptyStyle?.size === undefined ? 4 : config.emptyStyle?.size
        }

        this.#filledStyle = {
            borderColor: config?.filledStyle?.borderColor === undefined ? "#1c1c1c" : config.filledStyle?.borderColor,
            fillColor: config?.filledStyle?.fillColor === undefined ? fallbackColor(this.#dataType, 1) : config.filledStyle?.fillColor,
            borderSize: config?.filledStyle?.borderSize === undefined ? 1 : config.filledStyle?.borderSize,
            size: config?.filledStyle?.size === undefined ? 5 : config.filledStyle?.size
        }

        this.#onConnectionAdded = new Array<ConnectionChangeCallback>();
        if (config?.onConnectionAdded) {
            this.#onConnectionAdded.push(config?.onConnectionAdded);
        }

        this.#onConnectionRemoved = new Array<ConnectionChangeCallback>();
        if (config?.onConnectionRemoved) {
            this.#onConnectionRemoved.push(config?.onConnectionRemoved);
        }
    }

    addConnection(connection: Connection): void {
        this.#connections.push(connection);

        for (let i = 0; i < this.#onConnectionAdded.length; i++) {
            this.#onConnectionAdded[i](connection, this, this.#portType, this.#node);
        }
    }

    addConnectionAddedListener(callback: ConnectionChangeCallback) {
        this.#onConnectionAdded.push(callback);
    }

    addConnectionRemovedListener(callback: ConnectionChangeCallback) {
        this.#onConnectionRemoved.push(callback);
    }

    clearConnection(connection: Connection): void {
        const index = this.#connections.indexOf(connection);
        if (index > -1) {
            this.#connections.splice(index, 1);
            for (let i = 0; i < this.#onConnectionRemoved.length; i++) {
                this.#onConnectionRemoved[i](connection, this, this.#portType, this.#node);
            }
        } else {
            console.error("no connection found to remove");
        }
    }

    getType(): string {
        return this.#dataType;
    }

    getDisplayName(): string {
        return this.#displayName;
    }

    filledStyleColor(): string {
        if (this.#filledStyle.fillColor === undefined) {
            console.error("There's no fill color!!!!!!!!!")
            return "black";
        }
        return this.#filledStyle.fillColor;
    }

    #box: Box = { Position: { x: 0, y: 0 }, Size: { x: 0, y: 0 } };

    render(ctx: CanvasRenderingContext2D, position: Vector2, camera: Camera, mousePosition: Vector2 | undefined): Box {
        let style = this.#emptyStyle;
        if (this.#connections.length > 0) {
            style = this.#filledStyle;
        }

        let radius = style.size as number * camera.zoom

        if (mousePosition && InBox(this.#box, mousePosition)) {
            radius *= 1.25;
    
            ctx.textAlign = TextAlign.Center;
            ctx.fillText(this.#dataType, position.x , position.y + (radius * 3));
        }

        this.#box.Position.x = position.x - radius;
        this.#box.Position.y = position.y - radius;
        this.#box.Size.x = radius * 2;
        this.#box.Size.y = radius * 2;

        ctx.strokeStyle = style.borderColor as string;
        ctx.fillStyle = style.fillColor as string;
        ctx.beginPath();
        ctx.arc(position.x, position.y, radius, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();


        return this.#box;
    }
}