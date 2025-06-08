const binarySearch = ({ max, getValue, match }) => {
    let min = 0;

    while (min <= max) {
        let guess = Math.floor((min + max) / 2);
        const compareVal = getValue(guess);

        if (compareVal === match) return guess;
        if (compareVal < match) min = guess + 1;
        else max = guess - 1;
    }

    return max;
};

export function fitString(ctx: CanvasRenderingContext2D, str: string, maxWidth: number): string {
    let width = ctx.measureText(str).width;
    const ellipsis = '…';
    const ellipsisWidth = ctx.measureText(ellipsis).width;
    if (width <= maxWidth || width <= ellipsisWidth) {
        return str;
    }

    const index = binarySearch({
        max: str.length,
        getValue: guess => ctx.measureText(str.substring(0, guess)).width,
        match: maxWidth - ellipsisWidth,
    });

    return str.substring(0, index) + ellipsis;
};

export function splitString(ctx: CanvasRenderingContext2D, str: string, maxWidth: number): Array<string> {
    let width = ctx.measureText(str).width;
    if (width <= maxWidth) {
        return [str];
    }

    let index = binarySearch({
        max: str.length,
        getValue: guess => ctx.measureText(str.substring(0, guess)).width,
        match: maxWidth,
    });

    for (let backward = index - 1; backward >= 1; backward--) {
        if (str.charAt(backward) === " ") {
            index = backward + 1;
            break;
        }
    }

    return [str.substring(0, index), str.substring(index)];
};


export function splitStringIntoLines(ctx: CanvasRenderingContext2D, str: string, maxWidth: number): Array<string> {
    let width = ctx.measureText(str).width;
    if (width <= maxWidth) {
        return [str];
    }

    const strings = new Array<string>;
    let remaining = str;
    while (remaining !== "") {
        let index = binarySearch({
            max: remaining.length,
            getValue: guess => ctx.measureText(remaining.substring(0, guess)).width,
            match: maxWidth,
        });

        if (index === remaining.length) {
            strings.push(remaining.substring(0, index))
            break;
        }

        for (let backward = index - 1; backward >= 1; backward--) {
            if (remaining.charAt(backward) === " ") {
                index = backward + 1;
                break;
            }
        }

        strings.push(remaining.substring(0, index))
        remaining = remaining.substring(index)
    }

    return strings;
};

// https://stackoverflow.com/a/18234317/4974261
export function Format(str: string, ...args: Array<string>): string {
    if (arguments.length) {
        for (let key in args) {
            str = str.replace(new RegExp("\\{" + key + "\\}", "gi"), args[key]);
        }
    }
    return str;
};