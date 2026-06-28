import { ContextMenuConfig, ContextMenuItemConfig } from "./contextMenu";
import { ContainerRenderElement as ContainerElement } from "./elements/container";
import { IRenderElement } from "./elements/interfaces";
import { TextAlign, TextElement as TextElement, VerticalAlign } from "./elements/text";
import { FontWeight } from "./styles/text";
import { Theme } from "./theme";
import { Text } from './types/text';
import { ScaleVector, Vector2 } from './types/vector2';
import { Display } from './elements/base';

class QuickMenuGroup {

    #text: TextElement;

    public items: Array<QuickMenuItem>;

    constructor(text: TextElement, items: Array<QuickMenuItem>) {
        this.#text = text;
        this.items = items;
    }

    updateRendering(terms: Array<string>): void {
        let shouldRender = false;
        for (let i = 0; i < this.items.length; i++) {
            const kept = this.items[i].filter(terms);
            this.items[i].render(kept);
            if (kept) {
                shouldRender = true;
            }
        }

        this.#text.setDisplay(shouldRender ? Display.Flex : Display.None);
    }

}

class QuickMenuItem {
    #searchText: string;
    #text: TextElement;
    #context: ContextMenuItemConfig

    constructor(searchText: string, text: TextElement, context: ContextMenuItemConfig) {
        this.#searchText = searchText.toLowerCase();
        this.#text = text;
        this.#context = context;
    }

    filter(terms: Array<string>): boolean {
        if (terms.length === 0) {
            return true;
        }
        for (let i = 0; i < terms.length; i++) {
            if (terms[i] === "") {
                continue;
            }

            if (this.#searchText.indexOf(terms[i]) === -1) {
                return false;
            }
        }
        return true;
    }

    render(render: boolean): void {
        this.#text.setDisplay(render ? Display.Flex : Display.None);
    }

    rendering(): boolean {
        return this.#text.getDisplay() === Display.Flex;
    }

    highlight(highlight: boolean): void {
        this.#text.setBackgroundColor(highlight ? Theme.ContextMenu.HighlightColor : "");
    }

    select(): void {
        if (this.#context.callback) {
            this.#context.callback()
        }
    }
}

function RecurseBuildContainers(
    path: string,
    config: ContextMenuConfig,
    renderElements: Array<IRenderElement>,
    groups: Array<QuickMenuGroup>
): void {

    let currentPath = config?.name ?? "";
    if (path !== "") {
        currentPath = path + " / " + currentPath;
    }

    if (config?.items && config.items.length > 0) {
        const titleText = new TextElement(
            new Text(
                currentPath,
                {
                    color: Theme.ContextMenu.FontColor,
                    weight: FontWeight.Bold,
                    size: 12,
                }
            ),
            {
                Align: TextAlign.Center,
                VerticalAlign: VerticalAlign.Center,
                Padding: 16
            }
        );
        renderElements.push(titleText);

        const quickItems = new Array<QuickMenuItem>();

        for (let i = 0; i < config.items.length; i++) {
            const configItem = config.items[i];

            const itemText = new TextElement(
                new Text(
                    configItem.name ?? "Item",
                    {
                        color: Theme.ContextMenu.FontColor,
                    }
                ),
                {
                    Padding: 8
                }
            );

            quickItems.push(new QuickMenuItem(
                currentPath + (configItem.name ?? ""),
                itemText,
                configItem
            ));

            renderElements.push(itemText);
        }

        groups.push(new QuickMenuGroup(titleText, quickItems));
    }

    if (config?.subMenus) {
        for (let i = 0; i < config?.subMenus.length; i++) {
            const configItem = config?.subMenus[i];
            RecurseBuildContainers(currentPath, configItem, renderElements, groups);
        }
    }
}

export class QuickMenu {

    #menuGroups: Array<QuickMenuGroup>

    #container: ContainerElement

    #searchText: Text;

    #currentSelection: number;

    constructor(config?: ContextMenuConfig) {
        this.#menuGroups = [];
        this.#currentSelection = 0;

        this.#searchText = new Text(
            "",
            {
                color: Theme.ContextMenu.FontColor,
            }
        );

        const elements = [
            new TextElement(
                new Text(
                    "Search",
                    {
                        color: Theme.ContextMenu.FontColor,
                    }
                ),
                {
                    Padding: {
                        Bottom: 0,
                        Left: 8,
                        Right: 8,
                        Top: 8
                    },
                }
            ),

            // Search Box...
            new ContainerElement(
                [
                    new TextElement(
                        this.#searchText,
                        undefined
                    ),
                ],
                {
                    Border: {
                        Radius: 2,
                    },
                    BackgroundColor: "#003847",
                    Padding: 8,
                    Margin: 8,
                    MinHeight: 46,
                }
            ),
        ]

        if (config) {
            RecurseBuildContainers("", config, elements, this.#menuGroups);
        }

        this.#container = new ContainerElement(
            elements,
            {
                BackgroundColor: Theme.ContextMenu.BackgroundColor,
                Border: {
                    Thickness: 1,
                    Radius: 4
                }
            }
        )

        this.#updateHighlighting();
    }

    execute(): void {
        let selection = this.#currentSelection;

        for (let groupIndex = 0; groupIndex < this.#menuGroups.length; groupIndex++) {
            const group = this.#menuGroups[groupIndex];

            for (let itemIndex = 0; itemIndex < group.items.length; itemIndex++) {
                if (group.items[itemIndex].rendering()) {
                    if (selection === 0) {
                        group.items[itemIndex].select();
                        return;
                    }
                    selection--;
                }
            }
        }
    }

    #updateHighlighting(): void {
        const searchText = this.#searchText
            .get()
            .trim()
            .toLowerCase();

        let terms = new Array<string>();
        if (searchText !== "") {
            var potentialTerms = searchText.split(" ");
            for (let i = 0; i < potentialTerms.length; i++) {
                const cleaned = potentialTerms[i].trim();
                if (cleaned !== "") {
                    terms.push(cleaned);
                }
            }
        }

        let selection = this.#currentSelection;

        for (let groupIndex = 0; groupIndex < this.#menuGroups.length; groupIndex++) {
            const group = this.#menuGroups[groupIndex];
            group.updateRendering(terms);

            for (let itemIndex = 0; itemIndex < group.items.length; itemIndex++) {
                if (group.items[itemIndex].rendering()) {
                    group.items[itemIndex].highlight(selection === 0)
                    selection--;
                }
            }
        }
    }

    keyboardEvent(event: KeyboardEvent): void {

        let intercepted = true;

        if (event.code === "Backspace") {
            this.#currentSelection = 0;
            const text = this.#searchText.get();
            this.#searchText.set(text.slice(0, text.length - 1));
        } else if (/^[a-zA-Z0-9]$/.test(event.key) || event.key === " ") {
            this.#currentSelection = 0;
            this.#searchText.set(this.#searchText.get() + event.key);
        } else if (event.key === "ArrowUp") {
            this.#currentSelection = Math.max(0, this.#currentSelection - 1);
        } else if (event.key === "ArrowDown") {
            this.#currentSelection ++;
        } else {
            intercepted = false;
        }

        if (intercepted) {
            this.#updateHighlighting();
            event.preventDefault();
        }

        // console.log(event);
    }

    renderSize = { x: 0, y: 0 };

    public render(ctx: CanvasRenderingContext2D, pos: Vector2, graphScale: number, mousePosition: Vector2 | undefined): null {
        this.#container.calcSize(ctx, this.renderSize, { x: -1, y: -1 });
        // ScaleVector(this.renderSize, graphScale);

        // Clamp the position so it's not spilling off the canvas
        if (pos.y + Math.min(this.renderSize.y, 400) > ctx.canvas.clientHeight) {
            pos.y = ctx.canvas.clientHeight - Math.min(this.renderSize.y, 400);
        }

        if (pos.x + this.renderSize.x > ctx.canvas.clientWidth) {
            pos.x = ctx.canvas.clientWidth - this.renderSize.x;
        }

        if (pos.y < 0) {
            pos.y = 0;
        }

        if (pos.x < 0) {
            pos.x = 0;
        }

        this.#container.render(ctx, pos, 1, this.renderSize);
        return null;
    }
}
