import { Popup } from "../popup";

interface Config {
    title: string;
    startingValue: string;
    onUpdate: (newValue: string) => void;
    onCancel?: () => void;
}

export function SetStringPopup(config: Config): Popup {
    let input: HTMLInputElement | null = null;

    return new Popup({
        title: config.title,
        options: ["Set", "Cancel"],
        content: () => {
            const container = document.createElement('div');
            input = document.createElement('input')
            input.value = config.startingValue;
            container.append(input);
            return container;
        },
        onClose: (button: string | null): void => {
            if (button !== "Set" || input === null) {
                if(config.onCancel) {
                    config.onCancel();
                }
                return;
            }
            config.onUpdate(input.value);
        },
    });
}