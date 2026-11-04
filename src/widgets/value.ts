import { FlowNode } from "../node";
import { requestRender } from "../render_scheduler";
import { Vector2 } from "../types/vector2";
import { height, startingWidgetValue, width, WidgetBase } from "./widget";

export interface ValueWidgetConfig<T> {
    /**
     * A node property the widget shows and edits. Setting the property from
     * code updates the widget without counting as an edit.
     */
    property?: string;

    value?: T;

    label?: string;

    /**
     * The narrowest the widget gets, in graph units.
     */
    width?: number;

    /**
     * A person finished changing the value.
     */
    callback?: (value: T) => void;

    /**
     * The value moved while a person is still changing it.
     */
    onInput?: (value: T) => void;
}

export abstract class ValueWidget<T> extends WidgetBase {

    #node: FlowNode;

    #property: string | undefined;

    #value: T;

    #label: string;

    #width: number;

    #callback?: (value: T) => void;

    #onInput?: (value: T) => void;

    constructor(node: FlowNode, config: ValueWidgetConfig<T> | undefined, fallback: T) {
        super();
        this.#node = node;
        this.#property = config?.property;
        this.#label = config?.label ?? "";
        this.#width = config?.width ?? width;
        this.#value = startingWidgetValue(node, this.#property, config?.value, fallback);
        this.#callback = config?.callback;
        this.#onInput = config?.onInput;

        if (this.#property !== undefined) {
            node.setProperty(this.#property, this.#value);
            node.addPropertyChangeListener(this.#property, (_, next) => this.setValue(next));
        }
    }

    Size(): Vector2 {
        return { x: this.#width, y: height };
    }

    value(): T {
        return this.#value;
    }

    /**
     * Shows a new value without treating it as a person's edit: no callback
     * and no edit event.
     */
    setValue(value: T): void {
        if (this.equal(value, this.#value)) {
            return;
        }
        this.#value = value;
        this.valueChanged();
        if (this.#property !== undefined) {
            this.#node.setProperty(this.#property, value);
        }
        requestRender();
    }

    label(): string {
        return this.#label;
    }

    setLabel(label: string): void {
        this.#label = label;
        requestRender();
    }

    protected node(): FlowNode {
        return this.#node;
    }

    protected input(value: T): void {
        this.setValue(value);
        this.#onInput?.(value);
    }

    /**
     * Ends a person's edit. Nothing is reported when they ended where they
     * started.
     */
    protected commit(value: T, startedAt: T): void {
        this.setValue(value);
        if (this.equal(value, startedAt)) {
            return;
        }
        if (this.#property !== undefined) {
            this.#node.editProperty(this.#property, value);
        }
        this.#callback?.(value);
    }

    protected valueChanged(): void { }

    protected equal(a: T, b: T): boolean {
        return Object.is(a, b);
    }
}
