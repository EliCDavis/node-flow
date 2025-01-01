import { FlowNode } from "../node";
import { Publisher, PublisherConfig } from "./publisher";
import { ContextMenuConfig } from "../contextMenu";
import { Vector2 } from "../types/vector2";
import { nodeFlowGroup as nodeFlowContextMenuGroup, NodeSubsystem } from "./subsystem";

export type NodeCreatedCallback = (publisher: string, nodeType: string, node: FlowNode) => void;

interface NodeFactoryPublishers {
    [name: string]: PublisherConfig
}

export interface NodeFactoryConfig {
    publishers?: NodeFactoryPublishers
    onNodeCreated?: NodeCreatedCallback;
}

export class NodeFactory {
    #registeredPublishers: Map<string, Publisher>;

    #registeredCallbacks: Array<NodeCreatedCallback>;

    constructor(config?: NodeFactoryConfig) {
        this.#registeredPublishers = new Map<string, Publisher>();
        this.#registeredCallbacks = new Array<NodeCreatedCallback>();

        if (config?.onNodeCreated) {
            this.#registeredCallbacks.push(config?.onNodeCreated);
        }

        if (config?.publishers !== undefined) {
            for (let entry in config.publishers) {
                this.addPublisher(entry, new Publisher(config.publishers[entry]));
            }
        }
    }

    public addOnNodeCreatedListener(callback: NodeCreatedCallback): void {
        this.#registeredCallbacks.push(callback);
    }

    public addPublisher(identifier: string, publisher: Publisher): void {
        this.#registeredPublishers.set(identifier, publisher);
    }

    // I'm not even sure if I want this here? You can register on Publishers...
    // So why not just make people register with the publisher.
    // public register(publisher: string, nodeType: string, config: FlowNodeConfiguration): void {
    //     const foundPublisher = this.#registeredPublishers.get(publisher);
    //     if (foundPublisher === undefined) {
    //         console.error("no publisher registered with identifier:" + publisher);
    //         return;
    //     }

    //     foundPublisher.register(nodeType, config);
    // }

    public create(publisher: string, nodeType: string): FlowNode {
        const publisherIdentifier = this.#registeredPublishers.get(publisher)
        if (publisherIdentifier === undefined) {
            throw new Error("no publisher registered with identifier: " + publisher);
        }
        const node = publisherIdentifier.create(nodeType);

        for (let i = 0; i < this.#registeredCallbacks.length; i++) {
            const callback = this.#registeredCallbacks[i];
            callback(publisher, nodeType, node);
        }
        return node;
    }

    public openMenu(graph: NodeSubsystem, position: Vector2): ContextMenuConfig {
        const menus: Array<ContextMenuConfig> = [];
        for (let [_, publisher] of this.#registeredPublishers) {
            menus.push(publisher.contextMenu(graph, position))
        }
        return {
            name: "New Node",
            group: nodeFlowContextMenuGroup,
            subMenus: menus,
        };
    }
} 
