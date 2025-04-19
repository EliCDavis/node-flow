import { Popup } from "../popup";

interface FormValue {
    name: string;

    // https://html.spec.whatwg.org/multipage/input.html#dom-input-type
    type: string;

    startingValue: any;
}

interface Config {
    title: string;
    form: Array<FormValue>;
    onUpdate: (newValue: Array<any>) => void;
    onCancel?: () => void;
}

export function FormPopup(config: Config): Popup {
    let input = new Array<HTMLInputElement | null>();

    const setOption = "Set";
    const cancelOption = "Cancel";

    return new Popup({
        title: config.title,
        options: [setOption, cancelOption],
        content: () => {
            const container = document.createElement('div');
            container.style.flexDirection = "column";
            container.style.display = "flex";

            for (let i = 0; i < config.form.length; i++) {
                const title = document.createElement("h4");
                title.innerText = config.form[i].name;
                container.append(title);

                const ele = document.createElement('input');
                ele.value = config.form[i].startingValue;
                ele.type = config.form[i].type;
                container.append(ele);
                input.push(ele);
                container.append(document.createElement("br"));
            }

            return container;
        },
        onClose: (button: string | null): void => {
            if (button !== setOption || input === null) {
                if (config.onCancel) {
                    config.onCancel();
                }
                return;
            }

            const values = new Array<any>();
            for (let i = 0; i < config.form.length; i++) {
                values[i] = input[i]?.value;
            }
            config.onUpdate(values);
        },
    });
}
