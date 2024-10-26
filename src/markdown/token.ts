export enum MarkdownTokenType {
    Text = "Text",
    H1 = "H1",
    H2 = "H2",
    H3 = "H3",
    NewLine = "New Line",
    Star = "Star",
    Space = "Space",
    BackTick = "`"
}

export class MarkdownToken {

    #type: MarkdownTokenType;

    #lexeme: string

    #tokenStart: number

    #tokenEnd: number

    constructor(type: MarkdownTokenType, lexeme: string, tokenStart: number, tokenEnd: number) {
        this.#type = type;
        this.#lexeme = lexeme;
        this.#tokenStart = tokenStart;
        this.#tokenEnd = tokenEnd;
    }

    type(): MarkdownTokenType {
        return this.#type;
    }

    lexeme(): string {
        return this.#lexeme;
    }

    tokenStart(): number {
        return this.#tokenStart;
    }
    tokenEnd(): number {
        return this.#tokenEnd;
    }
}
