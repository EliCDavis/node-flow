import { Port, PortConfig, PortType } from "./port";
import { FontWeight, TextStyle, TextStyleConfig, TextStyleFallback } from "./styles/text";
import { Box, InBox } from "./types/box";
import { CopyVector2, Vector2, Zero } from "./types/vector2";
import { Widget } from './widgets/widget';
import { List } from './types/list';
import { BoxStyle, BoxStyleConfig, BoxStyleWithFallback } from "./styles/box";
import { Text } from "./types/text";
import { GlobalWidgetFactory } from "./widgets/factory";
import { Theme } from "./theme";
import { TextAlign } from "./styles/canvasTextAlign";
import { TextBaseline } from "./styles/canvasTextBaseline";
import { CombineContextMenus, ContextMenuConfig } from "./contextMenu";
import { nodeFlowGroup } from "./nodes/subsystem";
import { SetStringPopup } from "./popups/string";
import { ButtonWidget } from "./widgets/button";
import { FormPopup } from "./popups/form";
import { NumberWidget } from "./widgets/number";
import { StringWidget } from "./widgets/string";
import { ToggleWidget } from "./widgets/toggle";
import { ColorWidget } from "./widgets/color";
import { SliderWidget } from "./widgets/slider";
import { ImageWidget } from "./widgets/image";
import { VectorPool } from "./types/pool";
import { Camera } from "./camera";

const MINIMUM_NODE_WIDTH = 150;

type AnyPropertyChangeCallback = (propertyName: string, oldValue: any, newValue: any) => void
type PropertyChangeCallback = (oldValue: any, newValue: any) => void

interface NodeData {
    [name: string]: any;
}

export interface WidgetConfig {
    type?: string,
    config?: any
}

export interface FlowNodeTitleConfig {
    textStyle?: TextStyleConfig;
    color?: string;
    padding?: number;
}

export interface FlowNodeConfig {
    position?: Vector2;
    title?: string;
    locked?: boolean;
    data?: NodeData;
    canEdit?: boolean;
    contextMenu?: ContextMenuConfig;

    // Ports
    inputs?: Array<PortConfig>;
    outputs?: Array<PortConfig>;

    // Callbacks
    onGrab?: () => void;
    onRelease?: () => void;
    onSelect?: () => void;
    onUnselect?: () => void;
    onFileDrop?: (file: File) => void;

    // Widgets
    widgets?: Array<WidgetConfig>;

    // Styling
    titleStyle?: FlowNodeTitleConfig;
    idleBorder?: BoxStyleConfig;
    mouseOverBorder?: BoxStyleConfig;
    grabbedBorder?: BoxStyleConfig;
    selectedBorder?: BoxStyleConfig;
    portTextStyle?: TextStyleConfig;
}

export enum NodeState {
    Idle,
    MouseOver,
    Grabbed
}

export interface NodeIntersection {
    Node?: FlowNode

    // Port
    Port?: Port
    PortIndex?: number
    PortIsInput?: boolean

    // Widget
    Widget?: Widget
    WidgetIndex?: number

}

export class FlowNode {

    #position: Vector2;

    #title: Text;

    #input: Array<Port>;

    #output: Array<Port>;

    #widgets: Array<Widget>;

    #locked: boolean;

    #canEdit: boolean;

    #contextMenu: ContextMenuConfig | null;

    // Callbacks

    #onSelect: Array<() => void>;

    #onUnselect: Array<() => void>;

    #onFiledrop: Array<(file: File) => void>;

    // Styling ================================================================

    #titleStyle: BoxStyle;

    #selectedStyle: BoxStyle;

    #stateStyles: Map<NodeState, BoxStyle>;

    #padding: number;

    #portTextStyle: TextStyle;

    #elementSpacing: number;

    // Runtime ================================================================

    #selected: boolean;

    #inputPortPositions: List<Box>;

    #outputPortPositions: List<Box>;

    #widgetPositions: List<Box>;

    #data: NodeData;

    #registeredAnyPropertyChangeCallbacks: Array<AnyPropertyChangeCallback>;

    #registeredPropertyChangeCallbacks: Map<string, Array<PropertyChangeCallback>>;

    constructor(config?: FlowNodeConfig) {
        this.#input = new Array<Port>();
        this.#output = new Array<Port>();
        this.#widgets = new Array<Widget>();
        this.#inputPortPositions = new List<Box>();
        this.#outputPortPositions = new List<Box>();
        this.#widgetPositions = new List<Box>();
        this.#elementSpacing = 15;
        this.#locked = config?.locked === undefined ? false : config.locked;
        this.#data = config?.data === undefined ? {} : config?.data;
        this.#registeredPropertyChangeCallbacks = new Map<string, Array<PropertyChangeCallback>>();
        this.#registeredAnyPropertyChangeCallbacks = new Array<AnyPropertyChangeCallback>();
        this.#canEdit = config?.canEdit === undefined ? false : config.canEdit;
        this.#contextMenu = config?.contextMenu === undefined ? null : config.contextMenu;

        this.#selected = false;
        this.#onSelect = new Array<() => void>;
        this.#onUnselect = new Array<() => void>;
        this.#onFiledrop = new Array<(file: File) => void>;

        if (config?.onSelect) {
            this.#onSelect.push(config?.onSelect);
        }

        if (config?.onUnselect) {
            this.#onUnselect.push(config?.onUnselect);
        }

        if (config?.onFileDrop) {
            this.#onFiledrop.push(config?.onFileDrop);
        }

        this.#position = config?.position === undefined ? { x: 0, y: 0 } : config.position;
        this.#title = new Text(
            config?.title === undefined ? "" : config.title,
            TextStyleFallback(config?.titleStyle?.textStyle, {
                size: 16,
                weight: FontWeight.Bold,
                color: Theme.Node.FontColor
            })
        );

        this.#padding = config?.titleStyle?.padding === undefined ? 15 : config?.titleStyle?.padding;

        this.#stateStyles = new Map<NodeState, BoxStyle>();
        this.#stateStyles.set(NodeState.Idle, new BoxStyle(BoxStyleWithFallback(config?.idleBorder, {
            border: { color: Theme.Node.Border.Idle, size: 1 },
            radius: Theme.Node.BorderRadius,
            color: Theme.Node.BackgroundColor,
        })));
        this.#stateStyles.set(NodeState.MouseOver, new BoxStyle(BoxStyleWithFallback(config?.mouseOverBorder, {
            border: { color: Theme.Node.Border.MouseOver, size: 1.1, },
            radius: Theme.Node.BorderRadius,
            color: Theme.Node.BackgroundColor,
        })));
        this.#stateStyles.set(NodeState.Grabbed, new BoxStyle(BoxStyleWithFallback(config?.grabbedBorder, {
            border: { color: Theme.Node.Border.Grabbed, size: 2, },
            radius: Theme.Node.BorderRadius,
            color: Theme.Node.BackgroundColor,
        })));

        this.#selectedStyle = new BoxStyle(BoxStyleWithFallback(config?.selectedBorder, {
            border: { color: Theme.Node.Border.Selected, size: 1, },
            radius: Theme.Node.BorderRadius,
            color: Theme.Node.BackgroundColor,
        }));

        this.#portTextStyle = new TextStyle({
            size: config?.portTextStyle?.size === undefined ? 14 : config?.portTextStyle?.size,
            color: config?.portTextStyle?.color === undefined ? Theme.Node.Port.FontColor : config?.portTextStyle?.color,
            font: config?.portTextStyle?.font,
            weight: config?.portTextStyle?.weight,
        });

        if (config?.inputs !== undefined) {
            for (let i = 0; i < config.inputs.length; i++) {
                this.addInput(config.inputs[i]);
            }
        }

        if (config?.outputs !== undefined) {
            for (let i = 0; i < config.outputs.length; i++) {
                this.addOutput(config.outputs[i]);
            }
        }

        if (config?.widgets !== undefined) {
            for (let i = 0; i < config.widgets.length; i++) {
                const widget = config.widgets[i];
                if (widget.type === undefined) {
                    continue;
                }
                this.addWidget(GlobalWidgetFactory.create(this, widget.type, widget.config))
            }
        }
    }

    public selected(): boolean {
        return this.#selected;
    }

    public select(): void {
        if (this.#selected) {
            return;
        }
        this.#selected = true;
        for (let i = 0; i < this.#onSelect.length; i++) {
            this.#onSelect[i]();
        }
    }

    public addAnyPropertyChangeListener(callback: AnyPropertyChangeCallback): void {
        if (callback === undefined || callback === null) {
        }
        this.#registeredAnyPropertyChangeCallbacks.push(callback);
    }

    public addPropertyChangeListener(name: string, callback: PropertyChangeCallback): void {
        if (!this.#registeredPropertyChangeCallbacks.has(name)) {
            this.#registeredPropertyChangeCallbacks.set(name, []);
        }

        const callbacks = this.#registeredPropertyChangeCallbacks.get(name);
        if (callbacks === undefined) {
            return;
        }
        callbacks.push(callback);
    }

    public setProperty(name: string, value: any): void {
        const oldValue = this.#data[name];
        if (oldValue === value) {
            return;
        }

        this.#data[name] = value;

        for (let i = 0; i < this.#registeredAnyPropertyChangeCallbacks.length; i++) {
            this.#registeredAnyPropertyChangeCallbacks[i](name, oldValue, value);
        }

        const callbacks = this.#registeredPropertyChangeCallbacks.get(name);
        if (callbacks === undefined) {
            return;
        }

        for (let i = 0; i < callbacks.length; i++) {
            callbacks[i](oldValue, value);
        }
    }

    public getProperty(name: string): any {
        return this.#data[name];
    }

    #popupNodeTitleSelection(): void {
        SetStringPopup({
            title: "Set Node Title",
            startingValue: this.title(),
            onUpdate: (value: string): void => {
                this.setTitle(value);
            },
        }).Show()
    }

    #popupNewButtonWidget(): void {
        SetStringPopup({
            title: "New Button Widget Text",
            startingValue: "My Button",
            onUpdate: (value: string): void => {
                this.addWidget(new ButtonWidget({
                    text: value
                }));
            },
        }).Show()
    }

    #widgetSubmenu(): ContextMenuConfig {
        return {
            name: "Widget",
            items: [
                {
                    name: "Button",
                    callback: this.#popupNewButtonWidget.bind(this),
                },
                {
                    name: "Number",
                    callback: () => {
                        this.addWidget(new NumberWidget(this))
                    }
                },
                {
                    name: "Color",
                    callback: () => {
                        this.addWidget(new ColorWidget(this))
                    }
                },
                {
                    name: "Slider",
                    callback: () => {
                        FormPopup({
                            title: "New Slider",
                            form: [
                                {
                                    name: "min",
                                    type: "number",
                                    startingValue: 0
                                },
                                {
                                    name: "max",
                                    type: "number",
                                    startingValue: 100
                                }
                            ],
                            onUpdate: (data: Array<any>) => {
                                this.addWidget(new SliderWidget(this, {
                                    min: data[0],
                                    max: data[1],
                                }));
                            }
                        }).Show();
                    }
                },
                {
                    name: "String",
                    callback: () => {
                        this.addWidget(new StringWidget(this))
                    }
                },
                {
                    name: "Toggle",
                    callback: () => {
                        this.addWidget(new ToggleWidget(this))
                    }
                },
                {
                    name: "Image",
                    callback: () => {
                        FormPopup({
                            title: "New Image",
                            form: [
                                {
                                    name: "URL",
                                    type: "text",
                                    startingValue: "https://pbs.twimg.com/media/GYabtu6bsAA7m99?format=jpg&name=medium"
                                },
                                {
                                    name: "Max Width",
                                    type: "number",
                                    startingValue: MINIMUM_NODE_WIDTH
                                },
                                {
                                    name: "Max Height",
                                    type: "number",
                                    startingValue: MINIMUM_NODE_WIDTH
                                }
                            ],
                            onUpdate: (data: Array<any>) => {
                                this.addWidget(new ImageWidget({
                                    image: data[0],
                                    maxWidth: data[1],
                                    maxHeight: data[2],
                                }));
                            }
                        }).Show();
                    }
                }
            ]
        };
    }

    public contextMenu(): ContextMenuConfig {
        let config: ContextMenuConfig = {
            group: nodeFlowGroup,
            items: [],
            subMenus: [],
        }

        if (this.canEdit()) {
            config.subMenus?.push({
                group: nodeFlowGroup,
                name: "Edit",
                items: [
                    {
                        name: "Title",
                        callback: () => {
                            this.#popupNodeTitleSelection();
                        }
                    },
                ],
                subMenus: [{
                    name: "Add",
                    items: [
                        {
                            name: "Input",
                            callback: () => {
                                FormPopup({
                                    title: "New Input",
                                    form: [
                                        {
                                            name: "name",
                                            type: "text",
                                            startingValue: "input"
                                        },
                                        {
                                            name: "type",
                                            type: "text",
                                            startingValue: "string"
                                        }
                                    ],
                                    onUpdate: (data: Array<any>) => {
                                        this.addInput({
                                            name: data[0],
                                            type: data[1]
                                        })
                                    }
                                }).Show();
                            }
                        },
                        {
                            name: "Output",
                            callback: () => {
                                FormPopup({
                                    title: "New Output",
                                    form: [
                                        {
                                            name: "name",
                                            type: "text",
                                            startingValue: "output"
                                        },
                                        {
                                            name: "type",
                                            type: "text",
                                            startingValue: "string"
                                        }
                                    ],
                                    onUpdate: (data: Array<any>) => {
                                        this.addOutput({
                                            name: data[0],
                                            type: data[1]
                                        })
                                    }
                                }).Show();
                            }
                        },
                    ],
                    subMenus: [
                        this.#widgetSubmenu(),
                    ]
                }],
            })
        }

        if (this.locked()) {
            config.items?.push({
                name: "Unlock Node Position",
                group: nodeFlowGroup,
                callback: this.unlock.bind(this),
            });
        } else {
            config.items?.push({
                name: "Lock Node Position",
                group: nodeFlowGroup,
                callback: this.lock.bind(this),
            })
        }

        if (this.#contextMenu !== null) {
            config = CombineContextMenus(config, this.#contextMenu)
        }

        return config;
    }

    public unselect(): void {
        if (!this.#selected) {
            return;
        }
        this.#selected = false;
        for (let i = 0; i < this.#onUnselect.length; i++) {
            this.#onUnselect[i]();
        }
    }

    public addUnselectListener(callback: () => void): void {
        this.#onUnselect.push(callback);
    }

    public addSelectListener(callback: () => void): void {
        this.#onSelect.push(callback);
    }

    public dropFile(file: File): void {
        for (let i = 0; i < this.#onFiledrop.length; i++) {
            this.#onFiledrop[i](file);
        }
    }

    public addFileDropListener(callback: (file: File) => void): void {
        this.#onFiledrop.push(callback);
    }

    public locked(): boolean {
        return this.#locked;
    }

    public lock(): void {
        this.#locked = true;
    }

    public unlock(): void {
        this.#locked = false;
    }

    public setPosition(position: Vector2): void {
        CopyVector2(this.#position, position);
    }

    // #measureTitleText(ctx: CanvasRenderingContext2D, scale: number): Vector2 {
    //     return this.#titleTextStyle.measure(ctx, scale, this.#title);
    // }

    public calculateBounds(ctx: CanvasRenderingContext2D, camera: Camera): Box {
        const tempMeasurement = Zero();

        const doublePadding = this.#padding * 2;

        const screenSpacePosition = Zero();
        camera.graphSpaceToScreenSpace(this.#position, screenSpacePosition);

        const size = Zero();
        this.#title.size(ctx, 1, size);

        size.x += doublePadding;
        size.y += doublePadding + (this.#elementSpacing * this.#input.length);

        for (let i = 0; i < this.#input.length; i++) {
            const port = this.#input[i];
            this.#portTextStyle.measure(ctx, 1, port.getDisplayName(), tempMeasurement);
            size.y += tempMeasurement.y;
            size.x = Math.max(size.x, tempMeasurement.x + doublePadding)
        }

        size.y += (this.#elementSpacing * this.#output.length);

        for (let i = 0; i < this.#output.length; i++) {
            const port = this.#output[i];
            this.#portTextStyle.measure(ctx, 1, port.getDisplayName(), tempMeasurement);
            size.y += tempMeasurement.y;
            size.x = Math.max(size.x, tempMeasurement.x + doublePadding)
        }

        size.y += (this.#elementSpacing * this.#widgets.length);
        for (let i = 0; i < this.#widgets.length; i++) {
            const element = this.#widgets[i];
            const eleSize = element.Size();
            size.y += eleSize.y
            size.x = Math.max(size.x, (eleSize.x) + doublePadding)
        }

        // Add some padding at the end!
        size.y += this.#elementSpacing

        size.x = Math.max(size.x, MINIMUM_NODE_WIDTH)
        size.x *= camera.zoom;
        size.y *= camera.zoom;

        return {
            Position: screenSpacePosition,
            Size: size,
        }
    }

    addInput(config: PortConfig): Port {
        const port = new Port(this, PortType.Input, config);
        this.#input.push(port);
        return port;
    }

    addOutput(config: PortConfig): Port {
        const port = new Port(this, PortType.Output, config);
        this.#output.push(port);
        return port;
    }

    addWidget(widget: Widget): void {
        this.#widgets.push(widget);
    }

    getWidget(index: number): Widget {
        return this.#widgets[index];
    }

    widgetCount(): number {
        return this.#widgets.length;
    }

    translate(delta: Vector2): void {
        this.#position.x += delta.x;
        this.#position.y += delta.y;
    }

    inBounds(ctx: CanvasRenderingContext2D, camera: Camera, position: Vector2): NodeIntersection {
        var intersection: NodeIntersection = {}

        const box = this.calculateBounds(ctx, camera);
        if (InBox(box, position)) {
            intersection.Node = this;
        }

        for (let i = 0; i < this.#inputPortPositions.Count(); i++) {
            if (InBox(this.#inputPortPositions.At(i), position)) {
                intersection.Node = this;
                intersection.PortIndex = i;
                intersection.PortIsInput = true;
                intersection.Port = this.#input[i]
            }
        }

        for (let i = 0; i < this.#outputPortPositions.Count(); i++) {
            if (InBox(this.#outputPortPositions.At(i), position)) {
                intersection.Node = this;
                intersection.PortIndex = i;
                intersection.PortIsInput = false;
                intersection.Port = this.#output[i];
            }
        }

        for (let i = 0; i < this.#widgetPositions.Count(); i++) {
            if (InBox(this.#widgetPositions.At(i), position)) {
                intersection.Node = this;
                intersection.WidgetIndex = i;
                intersection.Widget = this.#widgets[i];
            }
        }

        return intersection;
    }

    canEdit(): boolean {
        return this.#canEdit;
    }

    title(): string {
        return this.#title.get();
    }

    setTitle(newTitle: string): void {
        // if (!this.#canEdit) {
        //     console.warn("setTitle instruction ignored, as node has been marked un-editable");
        // }
        this.#title.set(newTitle);
    }

    inputPortPosition(index: number): Box {
        return this.#inputPortPositions.At(index);
    }

    inputPort(index: number): Port {
        return this.#input[index];
    }

    inputs(): number {
        return this.#input.length;
    }

    outputPortPosition(index: number): Box {
        return this.#outputPortPositions.At(index);
    }

    outputPort(index: number): Port {
        return this.#output[index];
    }

    outputs(): number {
        return this.#output.length;
    }

    #calculateStyle(state: NodeState): BoxStyle {
        // Let the node being selected override the idle style
        if (this.#selected && state === NodeState.Idle) {
            return this.#selectedStyle;
        }

        let boxStyle = this.#stateStyles.get(state);
        if (boxStyle === undefined) {
            throw new Error("no registered border style for state: " + state)
        }
        return boxStyle;
    }

    render(ctx: CanvasRenderingContext2D, camera: Camera, state: NodeState, mousePosition: Vector2 | undefined): void {
        VectorPool.run(() => {
            const tempMeasurement = VectorPool.get();

            this.#inputPortPositions.Clear();
            this.#outputPortPositions.Clear();
            this.#widgetPositions.Clear();
            const scaledPadding = this.#padding * camera.zoom;
            const scaledElementSpacing = this.#elementSpacing * camera.zoom;

            const nodeBounds = this.calculateBounds(ctx, camera);

            // Background
            const nodeStyle = this.#calculateStyle(state);
            nodeStyle.Draw(ctx, nodeBounds, camera.zoom);

            // Title
            const borderSize = nodeStyle.borderSize();
            ctx.textAlign = TextAlign.Center;
            ctx.textBaseline = TextBaseline.Middle;

            const titleSize = VectorPool.get();
            this.#title.size(ctx, camera.zoom, titleSize);

            const titleBoxSize = VectorPool.get();
            titleBoxSize.x = nodeBounds.Size.x;
            titleBoxSize.y = titleSize.y + (scaledPadding * 2);

            ctx.fillStyle = "#154050"
            ctx.beginPath();
            ctx.roundRect(
                nodeBounds.Position.x + (borderSize * camera.zoom * 0.5),
                nodeBounds.Position.y + (borderSize * camera.zoom * 0.5),
                titleBoxSize.x - (borderSize * camera.zoom),
                titleBoxSize.y - (borderSize * camera.zoom * 0.5),
                [nodeStyle.radius() * camera.zoom, nodeStyle.radius() * camera.zoom, 0, 0]
            );
            ctx.fill();
            // ctx.stroke();

            const titlePosition = VectorPool.get();
            titlePosition.x = nodeBounds.Position.x + (nodeBounds.Size.x / 2)
            titlePosition.y = nodeBounds.Position.y + scaledPadding + (titleSize.y / 2)
            this.#title.render(ctx, camera.zoom, titlePosition);

            // Input Ports
            let startY = nodeBounds.Position.y + (scaledPadding * 2) + titleSize.y + scaledElementSpacing;
            const leftSide = nodeBounds.Position.x + scaledPadding;
            ctx.textAlign = TextAlign.Left;
            for (let i = 0; i < this.#input.length; i++) {
                const port = this.#input[i];
                this.#portTextStyle.measure(ctx, camera.zoom, port.getDisplayName(), tempMeasurement);
                const position = VectorPool.get();

                position.x = nodeBounds.Position.x;
                position.y = startY + (tempMeasurement.y / 2);

                // Text
                this.#portTextStyle.setupStyle(ctx, camera.zoom);
                ctx.fillText(port.getDisplayName(), leftSide, position.y);

                // Port
                this.#inputPortPositions.Push(port.render(ctx, position, camera, mousePosition));

                startY += tempMeasurement.y + scaledElementSpacing;
            }

            // Output Ports
            const rightSide = nodeBounds.Position.x + nodeBounds.Size.x;
            ctx.textAlign = TextAlign.Right;
            for (let i = 0; i < this.#output.length; i++) {
                const port = this.#output[i];
                this.#portTextStyle.measure(ctx, camera.zoom, port.getDisplayName(), tempMeasurement);
                const position = VectorPool.get();
                position.x = rightSide;
                position.y = startY + (tempMeasurement.y / 2);

                // Text
                this.#portTextStyle.setupStyle(ctx, camera.zoom);
                ctx.fillText(port.getDisplayName(), rightSide - scaledPadding, position.y);

                // Port
                this.#outputPortPositions.Push(port.render(ctx, position, camera, mousePosition));

                startY += tempMeasurement.y + scaledElementSpacing;
            }

            for (let i = 0; i < this.#widgets.length; i++) {
                const widget = this.#widgets[i];
                const widgetSize = widget.Size();
                const scaledWidgetWidth = widgetSize.x * camera.zoom;

                const position = VectorPool.get();
                position.x = nodeBounds.Position.x + ((nodeBounds.Size.x - scaledWidgetWidth) / 2);
                position.y = startY;

                this.#widgetPositions.Push(widget.Draw(ctx, position, camera.zoom, mousePosition));
                startY += (widgetSize.y * camera.zoom) + scaledElementSpacing;
            }
        })
    }
}
