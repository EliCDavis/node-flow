import { CombineContextMenus, ContextEntry, ContextMenu, ContextMenuConfig } from './contextMenu';
import { Theme } from "./theme";
import { MouseObserver } from "./input";
import { FlowNode } from "./node";
import { NodeCreatedCallback, NodeFactoryConfig } from "./nodes/factory";
import { TimeExecution } from "./performance";
import { CursorStyle } from "./styles/cursor";
import { CopyVector2, Vector2, Zero } from './types/vector2';
import { Clamp01 } from "./utils/math";
import { GraphSubsystem, RenderResults } from './graphSubsystem';
import { FlowNote } from "./notes/note";
import { NoteAddedCallback, NoteDragStartCallback, NoteDragStopCallback, NoteRemovedCallback, NoteSubsystem, NoteSubsystemConfig } from "./notes/subsystem";
import { ConnectionRendererConfiguration, DanglingConnection, InternalConnection, NodeAddedCallback, NodeRemovedCallback, NodeSubsystem } from "./nodes/subsystem";
import { Connection } from './connection';
import { Publisher } from './nodes/publisher';
import { VectorPool } from './types/pool';
import { Camera, CameraOrientation } from './camera';
export { CameraOrientation };
import { PassSubsystem } from './pass/subsystem';
import { QuickMenu } from './quickMenu';
import { onRenderRequested, renderContinuously, requestRender } from './render_scheduler';
import { Minimap, MinimapConfig } from './minimap';

export type GraphRenderer = (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, position: Vector2, scale: number) => void;

function BuildBackgroundRenderer(backgroundColor: string): GraphRenderer {
    return (canvas: HTMLCanvasElement, context: CanvasRenderingContext2D, position: Vector2, scale: number): void => {
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

export type CopyCallback = (nodes: Array<FlowNode>, connections: Array<InternalConnection>) => void;

export type PasteCallback = (position: Vector2) => void;

export interface FlowNodeGraphConfiguration {
    backgroundRenderer?: GraphRenderer;
    backgroundColor?: string;
    idleConnection?: ConnectionRendererConfiguration
    contextMenu?: ContextMenuConfig
    nodes?: NodeFactoryConfig
    board?: NoteSubsystemConfig
    minimap?: MinimapConfig
}

interface OpenContextMenu {
    Menu: ContextMenu
    Position: Vector2
}

interface OpenQuickMenu {
    Menu: QuickMenu
    Position: Vector2
}

class GraphView {

    #subsystems: Array<GraphSubsystem>;

    constructor(subsystems: Array<GraphSubsystem>) {
        this.#subsystems = subsystems;
    }

    clickStart(mousePosition: Vector2, camera: Camera, ctrlKey: boolean) {
        // Since the graph is rendered from 0 => n, n is the last thing 
        // rendererd and is always shown to the user. So if their clicking on
        // two things technically, we need to make sure it's whatever was most 
        // recently rendered. So we traverse n => 0. 
        for (let i = this.#subsystems.length - 1; i >= 0; i--) {
            // If the user sucesfully clicked on something in this layer, don't
            // check any more layers.
            if (this.#subsystems[i].clickStart(mousePosition, camera, ctrlKey)) {
                return;
            }
        }
    }

    fileDrop(file: File): boolean {
        for (let i = this.#subsystems.length - 1; i >= 0; i--) {
            if (this.#subsystems[i].fileDrop(file)) {
                return true;
            }
        }
        return false;
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

    render(ctx: CanvasRenderingContext2D, camera: Camera, mousePosition: Vector2 | undefined): RenderResults {
        const results: RenderResults = {};
        for (let i = 0; i < this.#subsystems.length; i++) {
            TimeExecution("Render_Subsystem_" + i, () => {
                let results = this.#subsystems[i].render(ctx, camera, mousePosition);
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

    #mousePosition: Vector2 | undefined;

    #camera: Camera;

    #openedContextMenu: OpenContextMenu | null;

    #openQuickMenu: OpenQuickMenu | null;

    #contextMenuEntryHovering: ContextEntry | null;

    #views: Array<GraphView>;

    #currentView: number;

    #mainNodeSubsystem: NodeSubsystem;

    #mainNoteSubsystem: NoteSubsystem;

    constructor(canvas: HTMLCanvasElement, config?: FlowNodeGraphConfiguration) {
        const postProcessPass = new PassSubsystem();

        this.#mainNodeSubsystem = new NodeSubsystem(postProcessPass, {
            nodes: config?.nodes,
            idleConnection: config?.idleConnection
        });

        this.#lastFrameCursor = CursorStyle.Default;
        this.#cursor = CursorStyle.Default;

        this.#mainNoteSubsystem = new NoteSubsystem(config?.board);

        this.#views = [
            new GraphView([
                this.#mainNoteSubsystem,
                this.#mainNodeSubsystem,
                postProcessPass
            ])
        ];
        this.#currentView = 0;

        this.#camera = new Camera();

        this.#contextMenuConfig = CombineContextMenus({
            items: [
                {
                    name: "Center on Graph",
                    group: contextMenuGroup,
                    callback: this.centerOnGraph.bind(this)
                },
            ],
        }, config?.contextMenu);

        this.#openedContextMenu = null;
        this.#openQuickMenu = null;
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

        this.#minimap = new Minimap(config?.minimap);

        this.#mainNodeSubsystem.setConnectionReleasedHandler((dangling) => {
            this.#openScopedMenu(dangling);
        });

        this.#watchCanvasSize();
        this.#stopRendering = onRenderRequested(this.#render.bind(this));
        requestRender();

        new MouseObserver(this.#canvas,
            this.#mouseDragEvent.bind(this),
            (mousePosition) => {
                this.#mousePosition = mousePosition;
            },
            this.#clickStart.bind(this),
            this.#clickEnd.bind(this),
            this.#openContextMenu.bind(this),
            this.#fileDrop.bind(this),
            (amount, anchor) => {
                this.zoom(amount, anchor);
            }
        );

        document.addEventListener(
            "keydown",
            (e) => {
                this.#keyDown(e);
                requestRender();
            }
        );
    }

    #copyCallbacks: Array<CopyCallback> = [];

    #pasteCallbacks: Array<PasteCallback> = [];

    public addCopyListener(callback: CopyCallback): void {
        this.#copyCallbacks.push(callback);
    }

    public addPasteListener(callback: PasteCallback): void {
        this.#pasteCallbacks.push(callback);
    }

    #raiseCopy(): void {
        const nodes = this.#mainNodeSubsystem.getSelectedNodes();
        if (nodes.length === 0) {
            return;
        }

        const connections = this.#mainNodeSubsystem.connectionsWithin(nodes);
        this.#copyCallbacks.forEach((callback) => callback(nodes, connections));
    }

    #raisePaste(): void {
        const position = this.#mousePosition === undefined
            ? { x: 0, y: 0 }
            : this.#sceenPositionToGraphPosition(this.#mousePosition);

        this.#pasteCallbacks.forEach((callback) => callback(position));
    }

    #deleteKey(e: KeyboardEvent): boolean {
        return e.code === "Delete" || e.code === "Backspace" || e.key === "Delete" || e.key === "Backspace";
    }

    #keyDown(e: KeyboardEvent): void {
        if (document.activeElement) {
            if (["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)) return;
        }

        if (this.#deleteKey(e)) {
            if (this.#mainNodeSubsystem.getSelectedNodes().length > 0) {
                e.preventDefault();
                this.#mainNodeSubsystem.removeSelectedNodes();
                return;
            }
        }

        if (e.ctrlKey || e.metaKey) {
            const letter = e.code.startsWith("Key")
                ? e.code.substring(3).toLowerCase()
                : (e.key ?? "").toLowerCase();

            switch (letter) {
                case "c":
                    this.#raiseCopy();
                    return;

                case "v":
                    this.#raisePaste();
                    return;

                // duplicate
                case "d":
                    e.preventDefault();
                    this.#raiseCopy();
                    this.#raisePaste();
                    return;
            }
        }

        if (this.#openQuickMenu) {
            if (e.code === "Escape") {
                this.#openQuickMenu = null;
                return;
            }

            if (e.code === "Enter") {
                this.#openQuickMenu.Menu.execute();
                this.#openQuickMenu = null;
                return;
            }

            this.#openQuickMenu.Menu.keyboardEvent(e);
            return
        }

        const spacePressed = e.key == " " || e.code == "Space";
        if (!spacePressed) {
            return;
        }

        if (!this.#mousePosition) {
            return;
        }
        const contextMenuPosition = this.#sceenPositionToGraphPosition(this.#mousePosition);

        let items = this.#mainNodeSubsystem.nodeFactory().newNodeSubmenus(this.#mainNodeSubsystem, contextMenuPosition);
        this.#openQuickMenu = {
            Menu: new QuickMenu({
                subMenus: items,
            }),
            Position: contextMenuPosition
        }
    }

    #fileDrop(file: File): void {

        if (this.currentView().fileDrop(file)) {
            return;
        }

        const contents = file.name.split('.');
        const extension = contents[contents.length - 1];
        if (extension !== "jpg" && extension !== "jpeg" && extension !== "png") {
            return;
        }

        let pos = Zero();
        if (this.#mousePosition) {
            CopyVector2(pos, this.#sceenPositionToGraphPosition(this.#mousePosition));
        }

        this.#mainNodeSubsystem.addNode(new FlowNode({
            title: contents[0],
            position: pos,
            widgets: [{
                type: "image",
                config: {
                    blob: file,
                }
            }]
        }));
    }

    public addNoteAddedListener(callback: NoteAddedCallback): void {
        this.#mainNoteSubsystem.addNoteAddedListener(callback);
    }

    public addNoteRemovedListener(callback: NoteRemovedCallback): void {
        this.#mainNoteSubsystem.addNoteRemovedListener(callback);
    }

    public addNoteDragStartListener(callback: NoteDragStartCallback): void {
        this.#mainNoteSubsystem.addNoteDragStartListener(callback);
    }

    public addNoteDragStopListener(callback: NoteDragStopCallback): void {
        this.#mainNoteSubsystem.addNoteDragStopListener(callback);
    }


    zoom(amount: number, anchor?: Vector2): void {
        const anchorPos = anchor ?? this.#mousePosition;

        let oldPos: Vector2 | undefined = undefined;
        if (anchorPos !== undefined) {
            oldPos = this.#sceenPositionToGraphPosition(anchorPos);
        }

        this.#camera.zoom += amount * this.#camera.zoom * 0.05;

        if (!oldPos || anchorPos === undefined) {
            return;
        }

        if (anchor !== undefined) {
            this.#mousePosition = anchor;
        }

        const newPos = this.#sceenPositionToGraphPosition(anchorPos);
        this.#camera.position.x += (newPos.x - oldPos.x) * this.#camera.zoom;
        this.#camera.position.y += (newPos.y - oldPos.y) * this.#camera.zoom;
    }

    #clickStart(mousePosition: Vector2, ctrlKey: boolean): void {
        if (this.#contextMenuEntryHovering !== null) {
            this.#contextMenuEntryHovering.click();
            this.#openedContextMenu = null;
            this.#contextMenuEntryHovering = null;
            return;
        }
        this.#openedContextMenu = null;
        this.#openQuickMenu = null;
        this.#contextMenuEntryHovering = null;

        this.#mousePosition = mousePosition;

        if (this.#minimap.contains(mousePosition)) {
            this.#lookAtFromMinimap(mousePosition);
            this.#draggingMinimap = true;
            return;
        }

        this.currentView().clickStart(mousePosition, this.#camera, ctrlKey);
    }

    #draggingMinimap: boolean = false;

    #lookAtFromMinimap(mousePosition: Vector2): void {
        const target: Vector2 = { x: 0, y: 0 };
        this.#minimap.graphPositionOf(mousePosition, target);

        // Centre the viewport on it rather than putting it in the corner.
        this.#camera.position.x = -(target.x * this.#camera.zoom) + (this.#canvas.width / 2);
        this.#camera.position.y = -(target.y * this.#camera.zoom) + (this.#canvas.height / 2);
        requestRender();
    }

    /** The minimap, so it can be turned on and sized by the host. */
    public minimap(): Minimap {
        return this.#minimap;
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

    /**
     * Returns currently selected nodes in stable graph order (same selection
     * state used by Ctrl+click and box-select styling via FlowNode.selected()).
     */
    getSelectedNodes(): Array<FlowNode> {
        return this.#mainNodeSubsystem.getSelectedNodes();
    }

    public unselectAllNodes(): void {
        this.#mainNodeSubsystem.unselectAllNodes();
    }

    public removeSelectedNodes(): Array<FlowNode> {
        return this.#mainNodeSubsystem.removeSelectedNodes();
    }

    /**
     * Returns a copy of the current camera orientation (screen-space pan + zoom).
     */
    getCamera(): CameraOrientation {
        return this.#camera.getOrientation();
    }

    /**
     * Restores a previously saved camera orientation.
     */
    setCamera(orientation: CameraOrientation): void {
        this.#camera.setOrientation(orientation);
    }

    /**
     * Resets the camera to the default orientation (origin, zoom 1).
     */
    resetCamera(): void {
        this.#camera.reset();
    }

    /**
     * Adjusts camera position and zoom so all nodes fit in view (~10% padding).
     * Falls back to camera.reset() when there are no nodes.
     */
    centerOnGraph(): void {
        const nodes = this.getNodes();
        if (nodes.length === 0) {
            this.#camera.reset();
            return;
        }

        // Identity camera so calculateBounds returns graph-space sizes.
        const measureCamera = new Camera();
        let minX = Infinity;
        let minY = Infinity;
        let maxX = -Infinity;
        let maxY = -Infinity;

        for (let i = 0; i < nodes.length; i++) {
            const bounds = nodes[i].calculateBounds(this.#ctx, measureCamera);
            minX = Math.min(minX, bounds.Position.x);
            minY = Math.min(minY, bounds.Position.y);
            maxX = Math.max(maxX, bounds.Position.x + bounds.Size.x);
            maxY = Math.max(maxY, bounds.Position.y + bounds.Size.y);
        }

        let width = maxX - minX;
        let height = maxY - minY;
        if (width <= 0 || height <= 0) {
            this.#camera.reset();
            return;
        }

        const padX = width * 0.05;
        const padY = height * 0.05;
        minX -= padX;
        minY -= padY;
        width += padX * 2;
        height += padY * 2;

        const canvasWidth = this.#canvas.clientWidth;
        const canvasHeight = this.#canvas.clientHeight;
        if (canvasWidth <= 0 || canvasHeight <= 0) {
            this.#camera.reset();
            return;
        }

        const zoom = Math.min(canvasWidth / width, canvasHeight / height);
        const centerX = minX + width / 2;
        const centerY = minY + height / 2;

        this.#camera.zoom = zoom;
        this.#camera.position.x = canvasWidth / 2 - centerX * zoom;
        this.#camera.position.y = canvasHeight / 2 - centerY * zoom;
    }

    connectedInputsNodeReferences(nodeIndex: number): Array<FlowNode> {
        return this.#mainNodeSubsystem.connectedInputsNodeReferencesByIndex(nodeIndex);
    }

    connectedOutputsNodeReferences(nodeIndex: number): Array<FlowNode> {
        return this.#mainNodeSubsystem.connectedOutputsNodeReferences(nodeIndex);
    }

    connectNodes(nodeOut: FlowNode, outPort: number, nodeIn: FlowNode, inPort: number): Connection | undefined {
        return this.#mainNodeSubsystem.connectNodes(nodeOut, outPort, nodeIn, inPort);
    }

    addNode(node: FlowNode): void {
        this.#mainNodeSubsystem.addNode(node);
    }

    removeNode(node: FlowNode): void {
        this.#mainNodeSubsystem.removeNode(node);
    }

    addNote(note: FlowNote): void {
        this.#mainNoteSubsystem.addNote(note);
    }

    removeNote(note: FlowNote): void {
        this.#mainNoteSubsystem.removeNote(note);
    }

    removeAllNotes(): void {
        this.#mainNoteSubsystem.removeAllNotes();
    }

    getNotes(): Array<FlowNote> {
        return this.#mainNoteSubsystem.getNotes();
    }

    public addOnNodeCreatedListener(callback: NodeCreatedCallback): void {
        this.#mainNodeSubsystem.addOnNodeCreatedListener(callback);
    }

    public addOnNodeAddedListener(callback: NodeAddedCallback): void {
        this.#mainNodeSubsystem.addOnNodeAddedListener(callback);
    }

    public addOnNodeRemovedListener(callback: NodeRemovedCallback): void {
        this.#mainNodeSubsystem.addOnNodeRemovedListener(callback);
    }

    #sceenPositionToGraphPosition(screenPosition: Vector2): Vector2 {
        const out = Zero();
        this.#camera.screenSpaceToGraphSpace(screenPosition, out);
        return out;
    }

    #openContextMenu(position: Vector2): void {
        let finalConfig = this.#contextMenuConfig;

        const contextMenuPosition = this.#sceenPositionToGraphPosition(position);

        finalConfig = CombineContextMenus(finalConfig, this.currentView().openContextMenu(this.#ctx, contextMenuPosition));

        this.#openedContextMenu = {
            Menu: new ContextMenu(finalConfig),
            Position: contextMenuPosition,
        };
    }

    #openScopedMenu(dangling: DanglingConnection): void {
        if (this.#mousePosition === undefined) {
            return;
        }

        const position = this.#sceenPositionToGraphPosition(this.#mousePosition);
        const menu = this.#mainNodeSubsystem.nodeFactory().openMenu(
            this.#mainNodeSubsystem,
            position,
            {
                needs: dangling.needs,
                types: dangling.types,
                onCreated: dangling.connectTo,
            },
        );

        this.#openedContextMenu = {
            Menu: new ContextMenu(menu),
            Position: position,
        };
        requestRender();
    }

    #clickEnd(): void {
        this.#draggingMinimap = false;
        this.currentView().clickEnd();
    }

    #mouseDragEvent(delta: Vector2): void {
        if (this.#draggingMinimap) {
            if (this.#mousePosition !== undefined) {
                this.#lookAtFromMinimap(this.#mousePosition);
            }
            return;
        }

        let draggingSomething = this.currentView().mouseDragEvent(delta, this.#camera.zoom);
        if (!draggingSomething) {
            this.#camera.position.x += delta.x;
            this.#camera.position.y += delta.y;
        }
    }

    #lastFrameCursor: CursorStyle;

    #cursor: CursorStyle;

    #minimap: Minimap;

    #stopRendering: () => void;

    #sizeObserver: ResizeObserver | undefined;

    #matchCanvasToParent(): void {
        const parent = this.#canvas.parentNode as HTMLElement | null;
        if (parent === null) {
            return;
        }

        const rect = parent.getBoundingClientRect();
        if (this.#canvas.width === rect.width && this.#canvas.height === rect.height) {
            return;
        }

        this.#canvas.width = rect.width;
        this.#canvas.height = rect.height;
    }

    #watchCanvasSize(): void {
        this.#matchCanvasToParent();

        const parent = this.#canvas.parentNode as HTMLElement | null;
        if (parent === null || typeof ResizeObserver === "undefined") {
            return;
        }

        this.#sizeObserver = new ResizeObserver(() => {
            this.#matchCanvasToParent();
            requestRender();
        });
        this.#sizeObserver.observe(parent);
    }

    public requestRender(): void {
        requestRender();
    }

    public renderContinuously(): () => void {
        return renderContinuously();
    }

    public dispose(): void {
        this.#stopRendering();
        this.#sizeObserver?.disconnect();
    }

    #render(): void {
        this.#matchCanvasToParent();

        this.#cursor = CursorStyle.Default;

        TimeExecution("Render_Background", this.#renderBackground.bind(this));

        TimeExecution("Render_View_" + this.#currentView, () => {
            let results = this.currentView().render(this.#ctx, this.#camera, this.#mousePosition);
            if (results?.cursorStyle) {
                this.#cursor = results?.cursorStyle;
            }
        });

        TimeExecution("Render_Minimap", () => {
            this.#minimap.render(this.#ctx, this.#canvas, this.#camera, this.#mainNodeSubsystem.getNodes());
        });

        TimeExecution("Render_Context", this.#renderContextMenu.bind(this));

        TimeExecution("Render_QuickMenu", this.#renderQuickMenu.bind(this))

        // Only update CSS style if things have changed
        // TODO: Does this actually have any measurable performance savings?
        if (this.#lastFrameCursor !== this.#cursor) {
            this.#canvas.style.cursor = this.#cursor;
        }
        this.#lastFrameCursor = this.#cursor;
    }

    #renderBackground(): void {
        this.#backgroundRenderer(this.#canvas, this.#ctx, this.#camera.position, this.#camera.zoom);
    }

    #renderContextMenu(): void {
        VectorPool.run(() => {
            if (this.#openedContextMenu !== null) {
                const pos = VectorPool.get();
                this.#camera.graphSpaceToScreenSpace(this.#openedContextMenu.Position, pos)
                this.#contextMenuEntryHovering = this.#openedContextMenu.Menu.render(this.#ctx, pos, this.#camera.zoom, this.#mousePosition, true);

                if (this.#contextMenuEntryHovering !== null) {
                    this.#cursor = CursorStyle.Pointer;
                }
            }
        });
    }

    #renderQuickMenu(): void {
        VectorPool.run(() => {
            if (this.#openQuickMenu !== null) {
                const pos = VectorPool.get();
                this.#camera.graphSpaceToScreenSpace(this.#openQuickMenu.Position, pos)
                this.#contextMenuEntryHovering = this.#openQuickMenu.Menu.render(this.#ctx, pos, this.#camera.zoom, this.#mousePosition);

                if (this.#contextMenuEntryHovering !== null) {
                    this.#cursor = CursorStyle.Pointer;
                }
            }
        });
    }
}