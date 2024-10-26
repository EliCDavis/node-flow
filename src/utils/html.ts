export function HtmlFromString(htmlString: string): Element {
    var div = document.createElement('div');
    div.innerHTML = htmlString;
    const child = div.firstElementChild;
    if (child === null || child === undefined) {
        throw new Error("unable to create html from string")
    }
    return child;
}

interface CSS {
    [name: string]: any
}

export function CssToString(css: CSS): string {
    let cssString = ""
    for (let entry in css) {
        cssString += entry + ":" + css[entry] + ";";
    }
    return cssString;
}