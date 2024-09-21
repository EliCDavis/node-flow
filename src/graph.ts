import { CombineContextMenus, ContextEntry, ContextMenu, ContextMenuConfig } from './contextMenu';
import { Theme } from "./theme";
import { MouseObserver } from "./input";
import { FlowNode } from "./node";
import { NodeFactoryConfig } from "./nodes/factory";
import { TimeExecution } from "./performance";
import { CursorStyle } from "./styles/cursor";
import { Vector2 } from './types/vector2';
import { Clamp01 } from "./utils/math";
import { GraphSubsystem, RenderResults } from './graphSubsystem';
import { FlowNote, FlowNoteConfig } from "./notes/note";
import { NoteSubsystem } from "./notes/subsystem";
import { ConnectionRendererConfiguration, NodeSubsystem } from "./nodes/subsystem";
import { Connection } from './connection';
import { Publisher } from './nodes/publisher';

export type GraphRenderer = (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, position: Vector2, scale: number) => void;

function BuildBackgroundRenderer(backgroundColor: string): GraphRenderer {
    return (canvas: HTMLCanvasElement, context: CanvasRenderingContext2D, position: Vector2, scale: number) => {
        context.fillStyle = backgroundColor;
        context.fillRect(0, 0, canvas.width, canvas.height);

        const alpha = Math.round(Clamp01(scale - 0.3) * 255)
        if (alpha <= 0) {
            return;
        }

        context.fillStyle = `rgba(41, 54, 57, ${alpha})`;
        const spacing = 100;
        const pi2 = 2 * Math.PI
        const dotScale = 2 * scale;
        for (let x = -50; x < 50; x++) {
            const xPos = (x * spacing * scale) + position.x;
            for (let y = -50; y < 50; y++) {
                const yPos = (y * spacing * scale) + position.y;
                context.beginPath();
                context.arc(xPos, yPos, dotScale, 0, pi2);
                context.fill();
            }
        }
    }
}

const contextMenuGroup = "graph-context-menu";

export interface FlowNodeGraphConfiguration {
    backgroundRenderer?: GraphRenderer;
    backgroundColor?: string;
    idleConnection?: ConnectionRendererConfiguration
    contextMenu?: ContextMenuConfig
    nodes?: NodeFactoryConfig
    notes?: Array<FlowNoteConfig>
}

interface OpenContextMenu {
    Menu: ContextMenu
    Position: Vector2
}

class GraphView {

    #subsystems: Array<GraphSubsystem>;

    constructor(subsystems: Array<GraphSubsystem>) {
        this.#subsystems = subsystems;
    }

    clickStart(mousePosition: Vector2, ctrlKey: boolean) {
        // Since the graph is rendered from 0 => n, n is the last thing 
        // rendererd and is always shown to the user. So if their clicking on
        // two things technically, we need to make sure it's whatever was most 
        // recently rendered. So we traverse n => 0. 
        for (let i = this.#subsystems.length - 1; i >= 0; i--) {
            // If the user sucesfully clicked on something in this layer, don't
            // check any more layers.
            if (this.#subsystems[i].clickStart(mousePosition, ctrlKey)) {
                return;
            }
        }
    }

    openContextMenu(ctx: CanvasRenderingContext2D, position: Vector2): ContextMenuConfig {
        let finalConfig: ContextMenuConfig = {};

        for (let i = 0; i < this.#subsystems.length; i++) {
            const subSystemMenu = this.#subsystems[i].openContextMenu(ctx, position);
            if (subSystemMenu !== null) {
                finalConfig = CombineContextMenus(finalConfig, subSystemMenu);
            }
        }

        return finalConfig;
    }

    clickEnd(): void {
        for (let i = 0; i < this.#subsystems.length; i++) {
            this.#subsystems[i].clickEnd();
        }
    }

    mouseDragEvent(delta: Vector2, scale: number): boolean {
        for (let i = 0; i < this.#subsystems.length; i++) {
            if (this.#subsystems[i].mouseDragEvent(delta, scale)) {
                return true;
            }
        }
        return false;
    }

    render(ctx: CanvasRenderingContext2D, scale: number, position: Vector2, mousePosition: Vector2 | undefined): RenderResults {
        const results: RenderResults = {};
        for (let i = 0; i < this.#subsystems.length; i++) {
            TimeExecution("Render_Subsystem_" + i, () => {
                let results = this.#subsystems[i].render(ctx, scale, position, mousePosition);
                if (results?.cursorStyle) {
                    results.cursorStyle = results?.cursorStyle;
                }
            })
        }
        return results;
    }
}

export class NodeFlowGraph {

    #ctx: CanvasRenderingContext2D;

    #canvas: HTMLCanvasElement;

    #backgroundRenderer: GraphRenderer

    #contextMenuConfig: ContextMenuConfig;

    #position: Vector2;

    #mousePosition: Vector2 | undefined;

    #scale: number;

    #openedContextMenu: OpenContextMenu | null;

    #contextMenuEntryHovering: ContextEntry | null;

    #views: Array<GraphView>;

    #currentView: number;

    #mainNodeSubsystem: NodeSubsystem;

    #mainNoteSubsystem: NoteSubsystem;

    constructor(canvas: HTMLCanvasElement, config?: FlowNodeGraphConfiguration) {
        this.#mainNodeSubsystem = new NodeSubsystem({
            nodes: config?.nodes,
            idleConnection: config?.idleConnection
        });

        this.#mainNoteSubsystem = new NoteSubsystem(config?.notes);

        this.#views = [
            new GraphView([
                this.#mainNoteSubsystem,
                this.#mainNodeSubsystem,
            ])
        ];
        this.#currentView = 0;

        this.#scale = 1;
        this.#position = { x: 0, y: 0 };

        this.#contextMenuConfig = CombineContextMenus({
            items: [
                {
                    name: "Reset View",
                    group: contextMenuGroup,
                    callback: this.#resetView.bind(this)
                },
            ],
        }, config?.contextMenu);

        this.#openedContextMenu = null;
        this.#contextMenuEntryHovering = null;

        this.#canvas = canvas;
        const ctx = canvas.getContext("2d")
        if (ctx === null) {
            throw new Error("could not create canvas context")
        }
        this.#ctx = ctx;

        if (config?.backgroundRenderer !== undefined) {
            this.#backgroundRenderer = config?.backgroundRenderer
        } else {
            const backgroundColor = config?.backgroundColor === undefined ? Theme.Graph.BackgroundColor : config.backgroundColor;
            this.#backgroundRenderer = BuildBackgroundRenderer(backgroundColor);
        }

        window.requestAnimationFrame(this.#render.bind(this));

        this.#canvas.addEventListener('wheel', (event) => {
            event.preventDefault();
            this.zoom(Math.sign(event.deltaY));
        }, false);

        new MouseObserver(this.#canvas,
            this.#mouseDragEvent.bind(this),

            // Mouse move event
            (mousePosition) => {
                this.#mousePosition = mousePosition;
            },

            this.#clickStart.bind(this),
            this.#clickEnd.bind(this),
            this.#openContextMenu.bind(this)
        );
    }

    zoom(amount: number): void {

        let oldPos: Vector2 | undefined = undefined;
        if (this.#mousePosition) {
            oldPos = this.#sceenPositionToMousePosition(this.#mousePosition);;
        }

        this.#scale += amount * this.#scale * 0.05;

        if (!oldPos || !this.#mousePosition) {
            return;
        }
        // Attempt zoom around where the current mouse is.
        const newPos = this.#sceenPositionToMousePosition(this.#mousePosition);
        this.#position.x += (newPos.x - oldPos.x) * this.#scale;
        this.#position.y += (newPos.y - oldPos.y) * this.#scale;
    }

    #clickStart(mousePosition: Vector2, ctrlKey: boolean): void {
        if (this.#contextMenuEntryHovering !== null) {
            this.#contextMenuEntryHovering.click();
            this.#openedContextMenu = null;
            this.#contextMenuEntryHovering = null;
            return;
        }
        this.#openedContextMenu = null;
        this.#contextMenuEntryHovering = null;

        this.#mousePosition = mousePosition;
        this.currentView().clickStart(mousePosition, ctrlKey);
    }

    currentView(): GraphView {
        return this.#views[this.#currentView];
    }

    organize(): void {
        this.#mainNodeSubsystem.organize(this.#ctx);
    }

    addPublisher(identifier: string, publisher: Publisher): void {
        this.#mainNodeSubsystem.addPublisher(identifier, publisher);
    }

    getNodes(): Array<FlowNode> {
        return this.#mainNodeSubsystem.getNodes();
    }

    connectedInputsNodeReferences(nodeIndex: number): Array<FlowNode> {
        return this.#mainNodeSubsystem.connectedInputsNodeReferences(nodeIndex);
    }

    connectedOutputsNodeReferences(nodeIndex: number): Array<FlowNode> {
        return this.#mainNodeSubsystem.connectedOutputsNodeReferences(nodeIndex);
    }

    connectNodes(nodeOut: FlowNode, outPort: number, nodeIn: FlowNode, inPort): Connection | undefined {
        return this.#mainNodeSubsystem.connectNodes(nodeOut, outPort, nodeIn, inPort);
    }

    addNode(node: FlowNode): void {
        this.#mainNodeSubsystem.addNode(node);
    }

    addNote(note: FlowNote): void {
        this.#mainNoteSubsystem.addNote(note);
    }

    #sceenPositionToMousePosition(screenPosition: Vector2): Vector2 {
        return {
            x: (screenPosition.x / this.#scale) - (this.#position.x / this.#scale),
            y: (screenPosition.y / this.#scale) - (this.#position.y / this.#scale),
        }
    }

    #openContextMenu(position: Vector2): void {
        let finalConfig = this.#contextMenuConfig;

        const contextMenuPosition = this.#sceenPositionToMousePosition(position);

        finalConfig = CombineContextMenus(finalConfig, this.currentView().openContextMenu(this.#ctx, contextMenuPosition));

        this.#openedContextMenu = {
            Menu: new ContextMenu(finalConfig),
            Position: contextMenuPosition,
        };
    }

    #resetView(): void {
        this.#scale = 1;
        this.#position.x = 0;
        this.#position.y = 0;
    }

    // Somethings wrong here. Needs more testing
    // #fitView(): void {
    //     if (this.#nodes.length === 0) {
    //         return;
    //     }

    //     const curBox: Box = {
    //         Position: { x: 0, y: 0 },
    //         Size: { x: 0, y: 0 }
    //     };
    //     CopyBox(curBox, this.#nodes[0].calculateBounds(this.#ctx, this.#position, this.#scale));

    //     for (let i = 1; i < this.#nodes.length; i++) {
    //         ExpandBox(curBox, this.#nodes[i].calculateBounds(this.#ctx, this.#position, this.#scale));
    //     }

    //     CopyVector2(this.#position, curBox.Position);
    // }

    #clickEnd(): void {
        this.currentView().clickEnd();
    }

    #mouseDragEvent(delta: Vector2): void {
        let draggingSomething = this.currentView().mouseDragEvent(delta, this.#scale);
        if (!draggingSomething) {
            this.#position.x += delta.x;
            this.#position.y += delta.y;
        }
    }

    #lastFrameCursor: CursorStyle;

    #cursor: CursorStyle;

    #render(): void {
        if (this.#canvas.parentNode !== null) {
            // Stupid as any because typescript doesn't think it exists
            var rect = (this.#canvas.parentNode as any).getBoundingClientRect();
            this.#canvas.width = rect.width;
            this.#canvas.height = rect.height;
        }


        this.#cursor = CursorStyle.Default;

        TimeExecution("Render_Background", this.#renderBackground.bind(this));

        TimeExecution("Render_View_" + this.#currentView, () => {
            let results = this.currentView().render(this.#ctx, this.#scale, this.#position, this.#mousePosition);
            if (results?.cursorStyle) {
                this.#cursor = results?.cursorStyle;
            }
        });

        TimeExecution("Render_Context", this.#renderContextMenu.bind(this));

        // Only update CSS style if things have changed
        // TODO: Does this actually have any measurable performance savings?
        if (this.#lastFrameCursor !== this.#cursor) {
            this.#canvas.style.cursor = this.#cursor;
        }
        this.#lastFrameCursor = this.#cursor;

        window.requestAnimationFrame(this.#render.bind(this));
    }

    #renderBackground(): void {
        this.#backgroundRenderer(this.#canvas, this.#ctx, this.#position, this.#scale);
    }

    #renderContextMenu(): void {
        if (this.#openedContextMenu !== null) {
            this.#contextMenuEntryHovering = this.#openedContextMenu.Menu.render(this.#ctx, {
                x: this.#position.x + (this.#openedContextMenu.Position.x * this.#scale),
                y: this.#position.y + (this.#openedContextMenu.Position.y * this.#scale),
            }, this.#scale, this.#mousePosition);

            if (this.#contextMenuEntryHovering !== null) {
                this.#cursor = CursorStyle.Pointer;
            }
        }
    }
}