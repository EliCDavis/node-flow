import { requestRender } from "./render_scheduler";

export interface BevelColors {
    Light: string;
    Dark: string;
}

const defaults = {
    FontFamily: "Courier New",
    Graph: {
        BackgroundColor: "#07212a",
        DotColor: "rgb(41, 54, 57)",
    },
    Node: {
        FontColor: "#afb9bb",
        BackgroundColor: "#0c2b35",
        Title: {
            Color: "#154050",
            FontColor: "#afb9bb",
            Padding: 5
        },
        BorderRadius: 15,
        Border: {
            Idle: "#1c1c1c",
            MouseOver: "#8e8e8e",
            Grabbed: "white",
            Selected: "#6e6e6e"
        },
        Bevel: null as BevelColors | null,
        Port: {
            FontColor: "#afb9bb"
        },
        Message: {
            InfoColor: "#afb9bb",
            WarnColor: "#f1f663ff",
            ErrorColor: "#FF0000"
        }
    },
    BoxSelect: {
        Color: "white",
        Size: 1,
        Radius: 2,
        LineDashLength: 5,
    },
    Widget: {
        FontColor: "#afb9bb",
        LabelColor: "#7f9497",
        FontSize: 14,
        Padding: 6,
        Gap: 4,
        BackgroundColor: "#0f313c",
        Border: {
            Color: "#154050",
            Size: 2,
            Radius: 2
        },
        Bevel: null as BevelColors | null,
        Hover: {
            BackgroundColor: "#195366"
        },
        Input: {
            BackgroundColor: "#0f313c",
            HoverBackgroundColor: "#195366",
            FontColor: "#afb9bb",
        },
        Slider: {
            FillColor: "#07212A",
        },
        Button: {
            Click: {
                BackgroundColor: "#1f637a"
            },
        }
    },
    ContextMenu: {
        BackgroundColor: "#07212A",
        HighlightColor: "#205A6D",
        HighlightFontColor: "#afb9bb",
        FontColor: "#afb9bb",
        DisabledFontColor: "#4a585c",
        BorderRadius: 5,
    },
    Minimap: {
        BackgroundColor: "rgba(10, 16, 18, 0.85)",
        BorderColor: "#1c1c1c",
        BorderRadius: 4,
        Padding: 6,
        NodeColor: "#6b7f85",
        ViewportColor: "rgba(175, 185, 187, 0.25)",
    },
    Popup: {
        BackgroundColor: "#000000",
        FontColor: "#ffffff",
        FontFamily: "Verdana",
        BorderRadius: 8,
        Backdrop: "#00000070",
    },
    Note: {
        FontColor: "#afb9bb",
        FontSize: 16,
        EntrySpacing: 20,
        LineSpacing: 5,
        DotSize: 3,
        HeaderLineWidth: 2,
        H1: {
            FontSize: 32,
        },
        H2: {
            FontSize: 16,
        },
        H3: {
            FontSize: 16,
        },
        CodeBlock: {
            BackgroundColor: "#0c2b35",
            FontColor: "#afb9bb",
            Padding: 16,
            BorderRadius: 4,
        }
    }
};

export type ThemeValues = typeof defaults;

type DeepPartial<T> = {
    [K in keyof T]?: T[K] extends BevelColors | null
        ? T[K]
        : T[K] extends object ? DeepPartial<T[K]> : T[K];
};

export type ThemeConfig = DeepPartial<ThemeValues>;

function clone<T>(value: T): T {
    return JSON.parse(JSON.stringify(value));
}

function merge(target: any, source: any): any {
    if (source === undefined) {
        return target;
    }
    if (source === null || typeof source !== "object" || target === null || typeof target !== "object") {
        return source;
    }
    for (const key of Object.keys(source)) {
        target[key] = merge(target[key], source[key]);
    }
    return target;
}

export const DefaultTheme: Readonly<ThemeValues> = Object.freeze(clone(defaults));

export const Theme: ThemeValues = clone(defaults);

let version = 0;

const listeners = new Set<() => void>();

/**
 * Replaces the theme: the defaults, with anything in config laid over them.
 * Everything already on screen picks the change up on its next draw.
 */
export function setTheme(config?: ThemeConfig): void {
    const next = merge(clone(defaults), config);
    for (const key of Object.keys(next) as Array<keyof ThemeValues>) {
        (Theme as any)[key] = next[key];
    }
    version++;
    listeners.forEach((listener) => listener());
    requestRender();
}

export function themeVersion(): number {
    return version;
}

export function onThemeChange(listener: () => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
}
