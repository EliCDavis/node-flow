export interface PopupConfig {
    title: string;
    options: Array<string>;

    onClose?: (button: string | null) => void;
    content?: () => Element;
    buttonCSS?: string;
}

export class Popup {

    #title: string;

    #options: Array<string>;

    #content?: () => Element;

    #onClose?: (button: string | null) => void;

    // Styling ================================================================

    #buttonCSS: string;

    // Runtime ================================================================

    #popup: HTMLDivElement | null;

    #keyHandler: ((e: KeyboardEvent) => void) | null;

    constructor(config: PopupConfig) {
        this.#title = config.title;
        this.#options = config.options;
        this.#content = config.content;
        this.#onClose = config.onClose;
        this.#buttonCSS = config.buttonCSS === undefined ? "flex-grow: 1; margin-right: 8px;" : config.buttonCSS;
        this.#popup = null;
        this.#keyHandler = null;
    }

    Hide(): void {
        if (this.#popup === null) {
            return;
        }
        if (this.#keyHandler !== null) {
            document.removeEventListener("keydown", this.#keyHandler, true);
            this.#keyHandler = null;
        }
        document.body.removeChild(this.#popup);
        this.#popup = null;
    }

    #close(option: string | null): void {
        this.Hide();
        if (this.#onClose !== undefined) {
            this.#onClose(option);
        }
    }

    Show(): void {
        this.#popup = document.createElement('div');
        this.#popup.style.cssText = 'position:absolute;top:0;width:100%;display:flex;height:100%;justify-content:center;align-items:center;background-color:#00000070;';
        document.body.appendChild(this.#popup);

        const container = document.createElement('div');
        container.style.cssText = 'background-color:#000;color:white;font-family:Verdana;border-radius:8px;padding:16px;';
        this.#popup.appendChild(container);

        const title = document.createElement("h2");
        title.textContent = this.#title;
        title.style.cssText = "margin-top:0;margin-bottom:16px;";
        container.appendChild(title)

        if (this.#content !== undefined) {
            container.appendChild(this.#content());
        }

        const buttonContainer = document.createElement("div");
        buttonContainer.style.cssText = 'margin-top:16px;justify-content:space-around;align-items:center;flex-direction:row;display:flex;';
        container.appendChild(buttonContainer);

        for (let i = 0; i < this.#options.length; i++) {
            const button = document.createElement("button");
            button.style.cssText = this.#buttonCSS;
            button.textContent = this.#options[i];
            button.onclick = () => this.#close(this.#options[i]);
            buttonContainer.appendChild(button);
        }

        this.#keyHandler = (e: KeyboardEvent): void => {
            if (e.key === "Enter") {
                e.preventDefault();
                this.#close(this.#options.length > 0 ? this.#options[0] : null);
            } else if (e.key === "Escape") {
                e.preventDefault();
                this.#close(null);
            }
            e.stopPropagation();
        };
        document.addEventListener("keydown", this.#keyHandler, true);
    }

} 