import { Camera } from "../camera";
import { Connection, ConnectionRenderer, DefaultConnectionRenderer } from "../connection";
import { CombineContextMenus, ContextMenuConfig } from "../contextMenu";
import { RenderResults } from "../graphSubsystem";
import { FlowNode, NodeState } from "../node";
import { Organize } from "../organize";
import { PassSubsystem } from "../pass/subsystem";
import { TimeExecution } from "../performance";
import { Port, PortType } from "../port";
import { BoxStyle } from "../styles/box";
import { CursorStyle } from "../styles/cursor";
import { Theme } from "../theme";
import { Box, BoxIntersection } from "../types/box";
import { List } from "../types/list";
import { Pool, VectorPool } from "../types/pool";
import { AddVector2, CopyVector2, SubVector2, Vector2, Zero } from "../types/vector2";
import { Widget } from "../widgets/widget";
import { NodeCreatedCallback, NodeFactory, NodeFactoryConfig } from "./factory";
import { Publisher } from "./publisher";

export type NodeAddedCallback = (node: FlowNode) => void;
export type NodeRemovedCallback = (node: FlowNode) => void;

export const nodeFlowGroup = "node-flow-graph-node-menu";

export interface ConnectionRendererConfiguration {
    size?: number;
    color?: string;

    mouseOverSize?: number;
    mouseOverColor?: string;

    renderer?: ConnectionRenderer;
}

function BuildConnectionRenderer(config: ConnectionRendererConfiguration | undefined): ConnectionRenderer {
    if (config?.renderer !== undefined) {
        return config.renderer;
    }

    return DefaultConnectionRenderer(
        config?.size === undefined ? 2 : config.size,
        undefined, // config?.color === undefined ? "#00FF00" : config.color,
        config?.mouseOverSize === undefined ? 4 : config.mouseOverSize,
        undefined, // config?.mouseOverColor === undefined ? "#00FF22" : config.mouseOverColor
    );
}

interface PortIntersection {
    Node: FlowNode;
    Port: Port;
    Index: number;
    InputPort: boolean;
}

interface NodeSubsystemConfig {
    idleConnection?: ConnectionRendererConfiguration
    nodes?: NodeFactoryConfig
}

export class NodeSubsystem {

    #postProcessPass: PassSubsystem;

    #nodes: Array<FlowNode>;

    #connections: Array<Connection>;

    #nodeHovering: number;

    #nodesGrabbed: List<number>;

    #connectionSelected: Connection | null;

    #idleConnectionRenderer: ConnectionRenderer

    #portHovering: PortIntersection | null;

    #widgetHovering: Widget | null;

    #widgetCurrentlyClicking: Widget | null;

    #cursor: CursorStyle;

    #nodeFactory: NodeFactory;

    #boxSelect: boolean;

    #boxSelectStart_graphSpace: Vector2;

    #boxSelectEnd_graphSpace: Vector2;

    #boxSelectionNodes: List<number>;

    #boxSelectStyle: BoxStyle;

    // LISTENERS ==============================================================

    #nodeRemovedCallbacks: Array<NodeRemovedCallback>;

    #registeredNodeAddedCallbacks: Array<NodeAddedCallback>;

    // ========================================================================

    constructor(postProcessPass: PassSubsystem, config?: NodeSubsystemConfig) {
        this.#postProcessPass = postProcessPass;
        this.#nodes = [];
        this.#nodeHovering = -1;
        this.#nodesGrabbed = new List<number>();
        this.#connectionSelected = null;
        this.#portHovering = null;
        this.#widgetHovering = null;
        this.#widgetCurrentlyClicking = null;
        this.#connections = new Array<Connection>();
        this.#nodeFactory = new NodeFactory(config?.nodes);
        this.#idleConnectionRenderer = BuildConnectionRenderer(config?.idleConnection);
        this.#registeredNodeAddedCallbacks = new Array<NodeAddedCallback>();
        this.#nodeRemovedCallbacks = new Array<NodeRemovedCallback>();
        this.#cursor = CursorStyle.Default;

        this.#boxSelect = false;
        this.#boxSelectStart_graphSpace = Zero();
        this.#boxSelectEnd_graphSpace = Zero();
        this.#boxSelectionNodes = new List<number>();
        this.#boxSelectStyle = new BoxStyle({
            border: {
                color: Theme.BoxSelect.Color,
                size: Theme.BoxSelect.Size,
            },
            color: "rgba(0,0,0,0)",
            radius: Theme.BoxSelect.Radius
        });
    }

    public addPublisher(identifier: string, publisher: Publisher): void {
        this.#nodeFactory.addPublisher(identifier, publisher);
    }

    public addOnNodeCreatedListener(callback: NodeCreatedCallback): void {
        this.#nodeFactory.addOnNodeCreatedListener(callback);
    }
    
    public nodeFactory(): NodeFactory {
        return this.#nodeFactory;
    }

    public addOnNodeAddedListener(callback: NodeAddedCallback): void {
        if (callback === null || callback === undefined) {
            return;
        }
        this.#registeredNodeAddedCallbacks.push(callback);
    }

    public addOnNodeRemovedListener(callback: NodeRemovedCallback): void {
        if (callback === null || callback === undefined) {
            return;
        }
        this.#nodeRemovedCallbacks.push(callback);
    }

    clickStart(mousePosition: Vector2, camera: Camera, ctrlKey: boolean): boolean {
        this.#boxSelect = false;

        let hoveringSomething = false;
        if (this.#nodeHovering > -1) {
            this.#selectNodeByIndex(this.#nodeHovering, !ctrlKey);

            for (let i = 0; i < this.#nodes.length; i++) {
                if (this.#nodes[i].selected()) {
                    this.#nodesGrabbed.Push(i);
                }
            }

            hoveringSomething = true;
        }

        if (this.#widgetHovering !== null) {
            this.#widgetHovering.ClickStart();
            this.#widgetCurrentlyClicking = this.#widgetHovering;
            hoveringSomething = true;
        }

        if (this.#portHovering === null) {

            if (ctrlKey && !hoveringSomething) {
                camera.screenSpaceToGraphSpace(mousePosition, this.#boxSelectStart_graphSpace)
                CopyVector2(this.#boxSelectEnd_graphSpace, this.#boxSelectStart_graphSpace);
                this.#boxSelect = true;
            }

            return hoveringSomething || ctrlKey;
        }

        if (this.#portHovering.InputPort) {
            for (let i = 0; i < this.#connections.length; i++) {
                if (this.#connections[i].inPort() === this.#portHovering.Port) {
                    this.#connections[i].clearInput();
                    this.#connectionSelected = this.#connections[i];
                    break;
                }
            }
        } else {
            let inNode: FlowNode | null = this.#portHovering.Node
            let inNodeIndex = this.#portHovering.Index
            let outNode: FlowNode | null = this.#portHovering.Node
            let outNodeIndex = this.#portHovering.Index

            if (this.#portHovering.InputPort) {
                outNode = null;
                outNodeIndex = -1;
            } else {
                inNode = null;
                inNodeIndex = -1;
            }

            const connection = new Connection(inNode, inNodeIndex, outNode, outNodeIndex, this.#idleConnectionRenderer);
            this.#connectionSelected = connection;
            this.#connections.push(connection);
        }

        return true;
    }

    mouseDragEvent(delta: Vector2, scale: number): boolean {
        let nodeMoved = false;

        VectorPool.run(() => {
            const scaledDelta = VectorPool.get();
            scaledDelta.x = delta.x / scale;
            scaledDelta.y = delta.y / scale;
            AddVector2(this.#boxSelectEnd_graphSpace, this.#boxSelectEnd_graphSpace, scaledDelta);

            if (this.#interactingWithNode()) {
                for (let i = 0; i < this.#nodesGrabbed.Count(); i++) {
                    const node = this.#nodes[this.#nodesGrabbed.At(i)];
                    if (node.locked()) {
                        continue;
                    }
                    node.translate(scaledDelta);
                    nodeMoved = true;
                }
            }
        });

        if (nodeMoved) {
            return true;
        }
        return this.#interactingWithConnection() || this.#interactingWithWidget() || this.#boxSelect;
    }

    clearNodeInputConnection(node: FlowNode, index: number): void {
        const port = node.inputPort(index);
        for (let i = this.#connections.length - 1; i >= 0; i--) {
            if (this.#connections[i].inPort() === port) {
                this.#removeConnection(this.#connections[i], true);
            }
        }
    }

    clickEnd(): void {

        for (let i = 0; i < this.#nodesGrabbed.Count(); i++) {
            const node = this.#nodes[this.#nodesGrabbed.At(i)];
            node.raiseDragStoppedEvent();
        }
        this.#nodesGrabbed.Clear();

        if (this.#boxSelect) {
            for (let i = 0; i < this.#boxSelectionNodes.Count(); i++) {
                this.#selectNode(this.#nodes[this.#boxSelectionNodes.At(i)], false);
            }

            this.#boxSelectionNodes.Clear();
            this.#boxSelect = false;
        }

        if (this.#widgetCurrentlyClicking !== null) {
            this.#widgetCurrentlyClicking.ClickEnd();
            this.#widgetCurrentlyClicking = null;
        }

        if (this.#connectionSelected === null) {
            return;
        }

        if (this.#portHovering === null) {
            this.#clearCurrentlySelectedConnection();
            return;
        }

        const port = this.#portHovering.Port;
        const conn = this.#connectionSelected;

        // If the port we're hovering is the one we started the connection 
        // with...
        if (port === conn.inPort() || port === conn.outPort()) {
            this.#clearCurrentlySelectedConnection();
            return;
        }

        // If the port we're hoving is input, and also we started the 
        // connection with an input, we can't do anything. We can't connect
        // input to input
        if (this.#portHovering.InputPort && conn.inPort() !== null) {
            this.#clearCurrentlySelectedConnection();
            return;
        }

        // Same with out. Can't connect output to output
        if (!this.#portHovering.InputPort && conn.outPort() !== null) {
            this.#clearCurrentlySelectedConnection();
            return;
        }

        // Different types, can't connect
        if (this.#portHovering.InputPort && this.#portHovering.Port.getDataType() !== conn.outPort()?.getDataType()) {
            this.#clearCurrentlySelectedConnection();
            return;
        }

        // Different types, can't connect
        if (!this.#portHovering.InputPort && this.#portHovering.Port.getDataType() !== conn.inPort()?.getDataType()) {
            this.#clearCurrentlySelectedConnection();
            return;
        }

        // Ight. Let's make the connection.
        if (this.#portHovering.InputPort) {
            let replace = false;
            const inputPort = this.#portHovering.Node.inputPort(this.#portHovering.Index);
            if (this.#portHovering.Port.getPortType() !== PortType.InputArray && inputPort.connections().length > 0) {
                replace = true;
            }

            if (replace) {
                // Remove input port's connection's output
                inputPort.connections()[0].clearOutput();

                // Remove connection from this subsystem
                this.#removeConnection(inputPort.connections()[0], false);
            }
            conn.setInput(this.#portHovering.Node, this.#portHovering.Index, replace);

        } else {
            conn.setOutput(this.#portHovering.Node, this.#portHovering.Index);
        }

        this.#connectionSelected = null;
    }

    connectNodes(nodeOut: FlowNode, outPort: number, nodeIn: FlowNode, inPort: number): Connection | undefined {
        const outType = nodeOut.outputPort(outPort).getDataType();
        const inType = nodeIn.inputPort(inPort).getDataType();
        if (outType !== inType) {
            console.error("can't connect nodes of different types", outType, inType);
            return;
        }

        // Check and make sure the nodes aren't already connected
        const existingInputConnections = nodeIn.inputPort(inPort).connections();
        for (let i = 0; i < existingInputConnections.length; i++) {
            const connection = existingInputConnections[i];


            if (connection.outNode() !== nodeOut) {
                continue;
            }

            if (connection.outPort() !== nodeOut.outputPort(outPort)) {
                continue;
            }

            // This kind of connection already *exists*. Let's not add a duplicate
            return;
        }

        const connection = new Connection(
            nodeIn, inPort,
            nodeOut, outPort,
            this.#idleConnectionRenderer,
        );
        this.#connections.push(connection);
        return connection;
    }

    getNodes(): Array<FlowNode> {
        return this.#nodes;
    }

    /**
     * Returns all nodes who are connected to the inputs of the 
     * node in question
     * 
     * @param nodeIndex index of the node to examine inputs to
     */
    connectedInputsNodeReferencesByIndex(nodeIndex: number): Array<FlowNode> {
        return this.connectedInputsNodeReferences(this.#nodes[nodeIndex]);
    }

    connectedInputsNodeReferences(node: FlowNode): Array<FlowNode> {
        const connections = new Array<FlowNode>();
        for (let i = 0; i < this.#connections.length; i++) {
            const connection = this.#connections[i];
            if (node !== connection.inNode()) {
                continue;
            }

            const outNode = connection.outNode();
            if (outNode === null) {
                continue;
            }

            connections.push(outNode);
        }
        return connections;
    }

    connectedOutputsNodeReferences(nodeIndex: number): Array<FlowNode> {
        const node = this.#nodes[nodeIndex]
        const connections = new Array<FlowNode>();
        for (let i = 0; i < this.#connections.length; i++) {
            const connection = this.#connections[i];
            if (node !== connection.outNode()) {
                continue;
            }

            const inNode = connection.inNode();
            if (inNode === null) {
                continue;
            }

            connections.push(inNode);
        }
        return connections;
    }

    addNode(node: FlowNode): void {
        this.#nodes.push(node);
        for (let i = 0; i < this.#registeredNodeAddedCallbacks.length; i++) {
            const callback = this.#registeredNodeAddedCallbacks[i];
            if (!callback) {
                continue;
            }
            callback(node);
        }
    }

    fileDrop(file: File): boolean {
        if (this.#nodeHovering === -1) {
            return false;
        }
        this.#nodes[this.#nodeHovering].dropFile(file);
        return true;
    }

    #removeNodeConnections(nodeIndex: number): void {
        if (nodeIndex >= this.#nodes.length || nodeIndex < 0) {
            console.error("invalid node connection");
            return;
        }
        for (let i = this.#connections.length - 1; i >= 0; i--) {
            if (this.#connections[i].referencesNode(this.#nodes[nodeIndex])) {
                this.#removeConnectionByIndex(i, true);
            }
        }
    }

    #interactingWithNode(): boolean {
        return this.#nodesGrabbed.Count() > 0;
    }

    #interactingWithConnection(): boolean {
        return this.#connectionSelected !== null;
    }

    #interactingWithWidget(): boolean {
        return this.#widgetCurrentlyClicking !== null;
    }

    #removeNodeByIndex(nodeIndex: number): void {
        this.#removeNodeConnections(nodeIndex);
        const node = this.#nodes[nodeIndex];
        this.#nodes.splice(nodeIndex, 1);
        for (let i = 0; i < this.#nodeRemovedCallbacks.length; i++) {
            this.#nodeRemovedCallbacks[i](node);
        }
    }

    #removeConnectionByIndex(index: number, clearPorts: boolean): void {
        if (clearPorts) {
            this.#connections[index].clearPorts();
        }
        this.#connections.splice(index, 1);
    }

    #removeConnection(connection: Connection, clearPorts: boolean): void {
        const index = this.#connections.indexOf(connection);
        if (index > -1) {
            this.#removeConnectionByIndex(index, clearPorts);
        } else {
            console.error("no connection found to remove");
        }
    }

    organize(ctx: CanvasRenderingContext2D): void {
        Organize(ctx, this);
    }

    #nodesSelected(): Array<number> {
        const selected = new Array<number>();
        for (let i = 0; i < this.#nodes.length; i++) {
            if (this.#nodes[i].selected()) {
                selected.push(i);
            }
        }
        return selected;
    }

    #organizeSelected(ctx: CanvasRenderingContext2D): void {
        Organize(ctx, this, this.#nodesSelected());
    }

    openContextMenu(ctx: CanvasRenderingContext2D, position: Vector2): ContextMenuConfig | null {

        const organizeNodesSubMenu: ContextMenuConfig = {
            name: "Organize",
            group: nodeFlowGroup,
            items: [
                {
                    name: "All Nodes",
                    group: nodeFlowGroup,
                    callback: () => {
                        this.organize(ctx);
                    }
                }
            ]
        }

        let config: ContextMenuConfig = {
            items: [],
            subMenus: [
                organizeNodesSubMenu,
                this.#nodeFactory.openMenu(this, position)
            ]
        }

        if (this.#nodesSelected().length > 0) {
            organizeNodesSubMenu.items?.push({
                name: "Selected Nodes",
                group: nodeFlowGroup,
                callback: () => {
                    this.#organizeSelected(ctx)
                }
            })
        }

        if (this.#nodeHovering > -1) {
            const nodeToReview = this.#nodeHovering;
            const nodeToReviewNode = this.#nodes[nodeToReview];

            config.subMenus?.push({
                group: nodeFlowGroup,
                name: "Select",
                items: [
                    {
                        name: "Direct Connected Nodes",
                        group: nodeFlowGroup,
                        callback: () => {
                            this.#selectConnectedNodes(nodeToReview);
                        }
                    },
                    {
                        name: "Input Nodes + Descendents",
                        group: nodeFlowGroup,
                        callback: () => {
                            this.#selectInputNodesAndDescendents(nodeToReviewNode);
                        }
                    },
                ]
            })

            config.subMenus?.push({
                group: nodeFlowGroup,
                name: "Delete",
                items: [
                    {
                        name: "Node",
                        group: nodeFlowGroup,
                        callback: () => {
                            this.#removeNodeByIndex(nodeToReview);
                        }
                    },
                    {
                        name: "Connections",
                        group: nodeFlowGroup,
                        callback: () => {
                            this.#removeNodeConnections(nodeToReview);
                        }
                    }
                ]
            })
            config = CombineContextMenus(config, nodeToReviewNode.contextMenu());
        }
        return config;
    }

    #selectInputNodesAndDescendents(node: FlowNode): void {
        if (node === undefined) {
            return;
        }
        this.#selectNode(node, false);

        const inputs = this.connectedInputsNodeReferences(node);
        for (let i = 0; i < inputs.length; i++) {
            this.#selectInputNodesAndDescendents(inputs[i]);
        }
    }

    #selectConnectedNodes(nodeIndex: number): void {
        const node = this.#nodes[nodeIndex];
        if (node === undefined) {
            return;
        }
        this.#selectNode(node, false);

        const outputs = this.connectedOutputsNodeReferences(nodeIndex);
        for (let i = 0; i < outputs.length; i++) {
            this.#selectNode(outputs[i], false);
        }

        const inputs = this.connectedInputsNodeReferencesByIndex(nodeIndex);
        for (let i = 0; i < inputs.length; i++) {
            this.#selectNode(inputs[i], false);
        }
    }

    #selectNodeByIndex(nodeIndex: number, unselectOthers: boolean): void {
        this.#selectNode(this.#nodes[nodeIndex], unselectOthers);
    }

    #selectNode(node: FlowNode, unselectOthers: boolean): void {
        node.select();

        if (!unselectOthers) {
            return;
        }

        for (let i = 0; i < this.#nodes.length; i++) {
            if (node === this.#nodes[i]) {
                continue
            }
            this.#nodes[i].unselect();
        }
    }

    #clearCurrentlySelectedConnection(): void {
        if (this.#connectionSelected === null) {
            return;
        }
        this.#removeConnection(this.#connectionSelected, true);
        this.#connectionSelected = null;
    }

    #renderConnections(ctx: CanvasRenderingContext2D, camera: Camera, mousePosition: Vector2 | undefined): void {
        for (let i = 0; i < this.#connections.length; i++) {
            let portMousedOver = false;
            if (mousePosition !== undefined) {
                portMousedOver = this.#connections[i].mouseOverPort(mousePosition) !== null;
            }
            this.#connections[i].render(ctx, camera.zoom, portMousedOver, mousePosition);
        }
    }

    #renderNodes(ctx: CanvasRenderingContext2D, camera: Camera, mousePosition: Vector2 | undefined) {
        this.#portHovering = null;
        this.#widgetHovering = null;
        this.#nodeHovering = -1;
        this.#boxSelectionNodes.Clear();

        const selectedBox_Screenspace = this.#boxSelectionScreenspaceBox(camera);

        for (let i = 0; i < this.#nodes.length; i++) {
            let state = NodeState.Idle;

            if (mousePosition !== undefined && !this.#boxSelect) {
                const intersection = this.#nodes[i].inBounds(ctx, camera, mousePosition);

                if (intersection.Node !== undefined && intersection.PortIndex === undefined && intersection.Widget === undefined) {
                    state = NodeState.MouseOver;
                    this.#nodeHovering = i;
                    this.#cursor = CursorStyle.Grab;
                }

                if (intersection.Widget !== undefined) {
                    // console.log(i, this.#nodes[i].title(), "widget")
                    this.#widgetHovering = intersection.Widget
                    this.#cursor = CursorStyle.Pointer;
                }

                if (intersection.Port !== undefined && intersection.Node !== undefined && intersection.PortIndex !== undefined && intersection.PortIsInput !== undefined) {
                    this.#portHovering = {
                        Index: intersection.PortIndex,
                        Node: intersection.Node,
                        Port: intersection.Port,
                        InputPort: intersection.PortIsInput
                    };
                }
            } else if (this.#boxSelect) {
                const nodeBounds = this.#nodes[i].calculateBounds(ctx, camera);

                if (BoxIntersection(selectedBox_Screenspace, nodeBounds)) {
                    state = NodeState.MouseOver;
                    this.#boxSelectionNodes.Push(i);
                }
            }

            // if (i === this.#nodeSelected) {
            //     state = NodeState.Selected;
            // }

            if (this.#nodes[i].selected() && this.#nodesGrabbed.Count() > 0) {
                state = NodeState.Grabbed;
                this.#cursor = CursorStyle.Grabbing;
            }

            this.#nodes[i].render(ctx, camera, state, mousePosition, this.#postProcessPass);
        }
    }

    #boxSelectionScreenspaceBox(camera: Camera): Box {
        const box = { Position: Zero(), Size: Zero() }

        camera.graphSpaceToScreenSpace(this.#boxSelectStart_graphSpace, box.Position);
        camera.graphSpaceToScreenSpace(this.#boxSelectEnd_graphSpace, box.Size);

        SubVector2(box.Size, box.Size, box.Position);

        return box;
    }

    render(ctx: CanvasRenderingContext2D, camera: Camera, mousePosition: Vector2 | undefined): RenderResults | undefined {
        this.#cursor = CursorStyle.Default;
        TimeExecution("Render_Connections", () => {
            this.#renderConnections(ctx, camera, mousePosition);
        })
        TimeExecution("Render_Nodes", () => {
            this.#renderNodes(ctx, camera, mousePosition);
        })

        if (this.#boxSelect) {
            const box = this.#boxSelectionScreenspaceBox(camera);
            ctx.setLineDash([Theme.BoxSelect.LineDashLength]);
            this.#boxSelectStyle.Draw(ctx, box, 1);
            ctx.setLineDash([]);
        }

        return { cursorStyle: this.#cursor }
    }

}