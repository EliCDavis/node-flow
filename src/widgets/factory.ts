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

export type WidgetBuilder = (node: FlowNode, confg?: any) => Widget;

class WidgetFactory {

    #registeredWidgets: Map<string, WidgetBuilder>

    constructor() {
        this.#registeredWidgets = new Map<string, WidgetBuilder>();
    }

    register(widgetType: string, builder: WidgetBuilder): void {
        this.#registeredWidgets.set(widgetType, builder);
    }

    create(node: FlowNode, widgetType: string, config: any): Widget {
        const builder = this.#registeredWidgets.get(widgetType)
        if (builder === undefined) {
            throw new Error("no builder registered for widget: " + widgetType);
        }
        return builder(node, config);
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

export { GlobalWidgetFactory };