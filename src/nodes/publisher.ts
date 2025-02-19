import { ContextMenuConfig, ContextMenuItemConfig } from "../contextMenu";
import { FlowNode, FlowNodeConfig } from '../node';
import { Vector2 } from "../types/vector2";
import { NodeSubsystem } from "./subsystem";

interface PublisherNodes {
    [name: string]: FlowNodeConfig
}

export interface PublisherConfig {
    name?: string;
    description?: string;
    version?: string;
    nodes?: PublisherNodes
}

export class Publisher {

    #name: string;

    #description: string;

    #version: string;

    #registeredNodes: Map<string, FlowNodeConfig>

    constructor(config?: PublisherConfig) {
        this.#name = config?.name === undefined ? "Unknown" : config.name;
        this.#description = config?.description === undefined ? "" : config.description;
        this.#version = config?.version === undefined ? "v0.0.0" : config.version;

        this.#registeredNodes = new Map<string, FlowNodeConfig>();

        if (config?.nodes !== undefined) {
            for (const nodeKey in config.nodes) {
                this.register(nodeKey, config.nodes[nodeKey]);
            }
        }
    }

    nodes(): Map<string, FlowNodeConfig> {
        return this.#registeredNodes;
    }

    register(nodeType: string, config: FlowNodeConfig): void {
        this.#registeredNodes.set(nodeType, config);
    }

    #recurseBuildMenu(graph: NodeSubsystem, name: string, subMenu: Map<string, FlowNodeConfig>, position: Vector2): ContextMenuConfig {
        const items: Array<ContextMenuItemConfig> = [];
        const subMenus = new Map<string, Map<string, FlowNodeConfig>>();

        for (let [key, nodeConfig] of subMenu) {
            const elements = key.split("/");
            if (elements.length === 1) {
                items.push({
                    name: key,
                    callback: () => {
                        const node = new FlowNode(nodeConfig);
                        node.setPosition(position);
                        graph.addNode(node);
                    },
                });
            } else {
                if (!subMenus.has(elements[0])) {
                    subMenus.set(elements[0], new Map<string, FlowNodeConfig>());
                }

                const menu = subMenus.get(elements[0]);
                elements.shift();
                menu?.set(elements.join("/"), nodeConfig)
            }
        }

        const menus: Array<ContextMenuConfig> = [];
        for (let [key, nodes] of subMenus) {
            menus.push(this.#recurseBuildMenu(graph, key, nodes, position))
        }

        return {
            name: name,
            items: items,
            subMenus: menus
        }
    }

    contextMenu(graph: NodeSubsystem, position: Vector2): ContextMenuConfig {
        return this.#recurseBuildMenu(graph, this.#name, this.#registeredNodes, position);
    }

    create(nodeType: string): FlowNode {
        const config = this.#registeredNodes.get(nodeType)
        if (config === undefined) {
            throw new Error("no builder registered for node: " + nodeType);
        }
        return new FlowNode(config);
    }
}