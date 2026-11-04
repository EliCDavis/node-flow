import { Widget } from "./widget";
import { NumberWidget, NumberWidgetConfig } from './number';
import { ButtonWidget, ButtonWidgetConfig } from './button';
import { ColorWidget, ColorWidgetConfig } from './color';
import { SliderWidget, SliderWidgetConfig } from './slider';
import { StringWidget, StringWidgetConfig } from './string';
import { ToggleWidget, ToggleWidgetConfig } from './toggle';
import { FlowNode } from "../node";
import { ImageWidget, ImageWidgetConfig } from "./image";
import { TextWidget, TextWidgetConfig } from "./text";
import { RowWidget, RowWidgetConfig } from "./row";

export interface RowWidgetFactoryConfig extends RowWidgetConfig {
    widgets: Array<WidgetConfig>;
}

export interface WidgetConfigs {
    button: ButtonWidgetConfig;
    number: NumberWidgetConfig;
    color: ColorWidgetConfig;
    slider: SliderWidgetConfig;
    string: StringWidgetConfig;
    toggle: ToggleWidgetConfig;
    image: ImageWidgetConfig;
    text: TextWidgetConfig;
    row: RowWidgetFactoryConfig;
}

export interface WidgetTypes {
    button: ButtonWidget;
    number: NumberWidget;
    color: ColorWidget;
    slider: SliderWidget;
    string: StringWidget;
    toggle: ToggleWidget;
    image: ImageWidget;
    text: TextWidget;
    row: RowWidget;
}

export type WidgetConfig = {
    [K in keyof WidgetConfigs]: { type: K; config?: WidgetConfigs[K] }
}[keyof WidgetConfigs];

export type WidgetBuilder = (node: FlowNode, config?: any) => Widget;

export class WidgetFactory {

    #registeredWidgets: Map<string, WidgetBuilder>

    constructor() {
        this.#registeredWidgets = new Map<string, WidgetBuilder>();
    }

    register(widgetType: string, builder: WidgetBuilder): void {
        this.#registeredWidgets.set(widgetType, builder);
    }

    create<K extends keyof WidgetConfigs>(node: FlowNode, widgetType: K, config?: WidgetConfigs[K]): WidgetTypes[K];
    create(node: FlowNode, widgetType: string, config?: unknown): Widget;
    create(node: FlowNode, widgetType: string, config?: unknown): Widget {
        const builder = this.#registeredWidgets.get(widgetType)
        if (builder === undefined) {
            throw new Error("no builder registered for widget: " + widgetType);
        }
        return builder(node, config);
    }

    createFromConfig(node: FlowNode, config: WidgetConfig): Widget {
        return this.create(node, config.type, config.config);
    }
}

const GlobalWidgetFactory = new WidgetFactory();

GlobalWidgetFactory.register("button", (node: FlowNode, config?: ButtonWidgetConfig) => new ButtonWidget(config));
GlobalWidgetFactory.register("number", (node: FlowNode, config?: NumberWidgetConfig) => new NumberWidget(node, config));
GlobalWidgetFactory.register("color", (node: FlowNode, config?: ColorWidgetConfig) => new ColorWidget(node, config));
GlobalWidgetFactory.register("slider", (node: FlowNode, config?: SliderWidgetConfig) => new SliderWidget(node, config));
GlobalWidgetFactory.register("string", (node: FlowNode, config?: StringWidgetConfig) => new StringWidget(node, config));
GlobalWidgetFactory.register("toggle", (node: FlowNode, config?: ToggleWidgetConfig) => new ToggleWidget(node, config));
GlobalWidgetFactory.register("image", (node: FlowNode, config?: ImageWidgetConfig) => new ImageWidget(config));
GlobalWidgetFactory.register("text", (node: FlowNode, config?: TextWidgetConfig) => new TextWidget(node, config));
GlobalWidgetFactory.register("row", (node: FlowNode, config?: RowWidgetFactoryConfig) => new RowWidget(
    (config?.widgets ?? []).map((child) => GlobalWidgetFactory.createFromConfig(node, child)),
    config,
));

export { GlobalWidgetFactory };
