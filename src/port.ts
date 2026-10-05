import { Camera } from "./camera";
import { Connection } from './connection';
import { requestRender } from "./render_scheduler";
import { RenderElementBase } from "./elements/base";
import { ContainerRenderElement, AlignItems } from './elements/container';
import { TextAlign, TextElement } from "./elements/text";
import { FlowNode } from "./node";
import { PassSubsystem } from "./pass/subsystem";
import { FontStyle } from "./styles/text";
import { Box, InBox } from "./types/box";
import { Text } from "./types/text";
import { Vector2 } from "./types/vector2";
import { Color, HSV, HSV2RGB, RgbToHex } from './utils/color';

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

type ConnectionChangeCallback = (connection: Connection, connectionIndex: number, port: Port, portType: PortType, node: FlowNode) => void

export interface PortConfig {
    name?: string;
    type?: string;
    description?: string;
    array?: boolean;

    /**
     * Lets this port connect to a port of any type, instead of only to one
     * declaring the same `type` string. For a port whose type is decided by
     * whatever gets wired into it, where `type` is a placeholder shown to
     * the user rather than a promise about the values passing through.
     */
    anyType?: boolean;

    /**
     * Every type this port takes, when it takes more than one. For a port
     * that works on a single value or an array of them, where `type` is
     * only the one it happens to be showing.
     *
     * An empty or absent list means the port takes exactly its `type`,
     * unless `anyType` says otherwise.
     */
    acceptedTypes?: Array<string>;

    emptyStyle?: PortStyle;
    filledStyle?: PortStyle;
    onConnectionAdded?: ConnectionChangeCallback;
    onConnectionRemoved?: ConnectionChangeCallback;
};

/**
 * Whether two ports may be connected, going by their types alone. Each port
 * offers the set of types it takes - one entry for an ordinary port, several
 * for a port that takes more than one, and none at all for a port that takes
 * anything. They connect when those sets overlap.
 */
export function portsCompatible(a: Port | undefined | null, b: Port | undefined | null): boolean {
    if (!a || !b) {
        return false;
    }

    return typeSetsCompatible(a.acceptedTypes(), b.acceptedTypes());
}

export function typeSetsCompatible(a: Array<string>, b: Array<string>): boolean {
    if (a.length === 0 || b.length === 0) {
        return true;
    }
    return a.some((type) => b.includes(type));
}

export function portConfigTypes(config: PortConfig): Array<string> {
    if (config.anyType === true) {
        return [];
    }
    if (config.acceptedTypes !== undefined && config.acceptedTypes.length > 0) {
        return config.acceptedTypes;
    }
    return [config.type === undefined ? "" : config.type];
}

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

    #anyType: boolean;

    #acceptedTypes: Array<string>;

    #description: string;

    #array: boolean;

    #configuredEmptyFill: string | undefined;

    #configuredFilledFill: string | undefined;

    #dataTypePopupElement: RenderElementBase;

    #onConnectionAdded: Array<ConnectionChangeCallback>;

    #onConnectionRemoved: Array<ConnectionChangeCallback>;

    constructor(node: FlowNode, portType: PortType, config?: PortConfig) {
        this.#node = node;
        this.#connections = new Array<Connection>();
        this.#portType = portType;
        this.#displayName = config?.name === undefined ? "Port" : config?.name;
        this.#dataType = config?.type === undefined ? "" : config?.type;
        this.#anyType = config?.anyType === true;
        this.#acceptedTypes = config?.acceptedTypes === undefined ? [] : config.acceptedTypes;
        this.#description = config?.description === undefined ? "" : config.description;
        this.#array = config?.array === true;
        this.#configuredEmptyFill = config?.emptyStyle?.fillColor;
        this.#configuredFilledFill = config?.filledStyle?.fillColor;

        this.#emptyStyle = {
            borderColor: config?.emptyStyle?.borderColor === undefined ? "#1c1c1c" : config.emptyStyle?.borderColor,
            fillColor: this.#configuredEmptyFill === undefined ? fallbackColor(this.#dataType, 0.3) : this.#configuredEmptyFill,
            borderSize: config?.emptyStyle?.borderSize === undefined ? 1 : config.emptyStyle?.borderSize,
            size: config?.emptyStyle?.size === undefined ? 4 : config.emptyStyle?.size
        }

        this.#filledStyle = {
            borderColor: config?.filledStyle?.borderColor === undefined ? "#1c1c1c" : config.filledStyle?.borderColor,
            fillColor: this.#configuredFilledFill === undefined ? fallbackColor(this.#dataType, 1) : this.#configuredFilledFill,
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

        this.#dataTypePopupElement = this.#buildTooltip();
    }

    #buildTooltip(): RenderElementBase {
        const containerElements = new Array<RenderElementBase>();

        let dataTypeDisplay = this.#dataType;
        if (this.#acceptedTypes.length > 1) {
            dataTypeDisplay = this.#acceptedTypes.join(" or ");
        }
        if (dataTypeDisplay === "" && this.#anyType) {
            dataTypeDisplay = "any";
        }
        if (this.#array) {
            dataTypeDisplay = "Array<" + dataTypeDisplay + ">"
        }
        containerElements.push(new TextElement(
            new Text(dataTypeDisplay, {
                color: "white",
            }),
            {
                Align: TextAlign.Center,
            }
        ));

        if (this.#description !== "") {
            containerElements.push(new TextElement(
                new Text(this.#description, { color: "white", style: FontStyle.Italic }),
                {
                    Align: TextAlign.Center,
                    Padding: { Top: 16 },
                    MaxWidth: 400,
                    LineHeight: 1.5
                }
            ));
        }

        return new ContainerRenderElement(
            containerElements,
            {
                BackgroundColor: "rgba(0, 0, 0, 0.85)",
                Border: {
                    Radius: 6,
                },
                Padding: 13,
            }
        );
    }

    #refreshDataType(): void {
        if (this.#configuredEmptyFill === undefined) {
            this.#emptyStyle.fillColor = fallbackColor(this.#dataType, 0.3);
        }
        if (this.#configuredFilledFill === undefined) {
            this.#filledStyle.fillColor = fallbackColor(this.#dataType, 1);
        }
        this.#dataTypePopupElement = this.#buildTooltip();
        requestRender();
    }

    setDataType(type: string): void {
        if (this.#dataType === type) {
            return;
        }
        this.#dataType = type;
        this.#refreshDataType();
    }

    setAnyType(anyType: boolean): void {
        if (this.#anyType === anyType) {
            return;
        }
        this.#anyType = anyType;
        this.#refreshDataType();
    }

    /**
     * Scope accepted types to singular type
     */
    settleOn(type: string): void {
        this.#acceptedTypes = [type];
        this.setDataType(type);
        this.#refreshDataType();
    }

    addConnection(connection: Connection): void {
        const c = this.#connections.length;
        this.#connections.push(connection);
        for (let i = 0; i < this.#onConnectionAdded.length; i++) {
            this.#onConnectionAdded[i](connection, c, this, this.#portType, this.#node);
        }
    }

    replaceConnection(connection: Connection, index: number): void {
        const c = this.#connections.length;
        this.#connections[index] = connection;
        for (let i = 0; i < this.#onConnectionAdded.length; i++) {
            this.#onConnectionAdded[i](connection, c, this, this.#portType, this.#node);
        }
    }

    addConnectionAddedListener(callback: ConnectionChangeCallback) {
        if (callback === undefined) {
            return;
        }
        this.#onConnectionAdded.push(callback);
    }

    connections(): Array<Connection> {
        return this.#connections;
    }

    addConnectionRemovedListener(callback: ConnectionChangeCallback) {
        if (callback === undefined) {
            return;
        }
        this.#onConnectionRemoved.push(callback);
    }

    clearConnection(connection: Connection): void {
        const index = this.#connections.indexOf(connection);
        if (index > -1) {
            this.#connections.splice(index, 1);
            for (let i = 0; i < this.#onConnectionRemoved.length; i++) {
                this.#onConnectionRemoved[i](connection, index, this, this.#portType, this.#node);
            }
        } else {
            console.error("no connection found to remove");
        }
    }

    getDataType(): string {
        return this.#dataType;
    }

    acceptsAnyType(): boolean {
        return this.#anyType;
    }

    /**
     * Every type this port takes. Empty means it takes anything.
     */
    acceptedTypes(): Array<string> {
        if (this.#anyType) {
            return [];
        }
        if (this.#acceptedTypes.length > 0) {
            return this.#acceptedTypes;
        }
        return [this.#dataType];
    }

    setAcceptedTypes(types: Array<string>): void {
        this.#acceptedTypes = types;
    }

    getPortType(): PortType {
        return this.#portType;
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

    render(ctx: CanvasRenderingContext2D, position: Vector2, camera: Camera, mousePosition: Vector2 | undefined, postProcess: PassSubsystem): Box {
        let style = this.#emptyStyle;
        if (this.#connections.length > 0) {
            style = this.#filledStyle;
        }

        let scaledRadius = style.size as number * camera.zoom

        if (mousePosition && InBox(this.#box, mousePosition)) {
            scaledRadius *= 1.25;

            // Redeclare so lambda is ensured to use these values
            const xPos = position.x;
            const yPos = position.y;

            // TODO: Make it so we're not creating a new lambda each frame
            postProcess.queue(() => {
                const size = { x: 0, y: 0 }
                this.#dataTypePopupElement.calcSize(ctx, size, { x: -1, y: -1 });
                // size.x = Math.min(150, size.x)
                this.#dataTypePopupElement.render(ctx, { x: xPos - (size.x / 2), y: yPos }, 1, size)
            })
        }

        this.#box.Position.x = position.x - scaledRadius;
        this.#box.Position.y = position.y - scaledRadius;
        this.#box.Size.x = scaledRadius * 2;
        this.#box.Size.y = scaledRadius * 2;

        ctx.strokeStyle = style.borderColor as string;
        ctx.fillStyle = style.fillColor as string;

        ctx.beginPath();
        if (this.#portType === PortType.InputArray) {
            ctx.rect(position.x - scaledRadius, position.y - scaledRadius, scaledRadius * 2, scaledRadius * 2)
        } else {
            ctx.arc(position.x, position.y, scaledRadius, 0, 2 * Math.PI);
        }
        ctx.fill();
        ctx.stroke();


        return this.#box;
    }
}