import { MarkdownToken, MarkdownTokenType } from "./token";

export class MarkdownLexicalParser {

    #body: string;

    #index: number

    #tokens: Array<MarkdownToken>;

    constructor(body: string) {
        this.#index = 0;
        this.#body = body;
        this.#tokens = new Array<MarkdownToken>();
    }

    tokens(): Array<MarkdownToken> {
        return this.#tokens;
    }

    #current(): string {
        if (this.#index > this.#body.length - 1) {
            return ""
        }
        return this.#body.charAt(this.#index);
    }

    #inc(): void {
        this.#index++
    }

    #next(): string {
        this.#index++
        if (this.#index > this.#body.length - 1) {
            return ""
        }
        return this.#body.charAt(this.#index);
    }

    #tokenStart = 0;

    #addToken(token: MarkdownTokenType, lexeme: string, start?: number): void {
        this.#tokens.push(new MarkdownToken(token, lexeme, start ?? this.#tokenStart, this.#index));
    }

    #header(): void {
        let count = 0;
        while (this.#current() === "#") {
            count++;
            this.#inc();
        }

        let type = MarkdownTokenType.H3;
        if (count === 1) {
            type = MarkdownTokenType.H1;
        } else if (count === 2) {
            type = MarkdownTokenType.H2;
        }

        this.#addToken(type, "#".repeat(count));
    }

    #whiteSpace(): void {
        let char = this.#current();

        while (char !== "") {
            if (char !== " " && char !== "\t") {
                break;
            }
            char = this.#next();
        }

        this.#addToken(MarkdownTokenType.Space, " ")
    }

    #text(): void {
        let char = this.#current();

        let started = -1;

        while (char !== "") {
            if (char === " " || char === "\t") {

                // Eat white space if we haven't seen anything yet!
                if (started === -1) {
                    this.#inc();
                    continue;
                }
            }

            // End of the line!
            if (char === "\n" || char === "*" || char === "`") {
                if (started != -1) {
                    this.#addToken(MarkdownTokenType.Text, this.#body.substring(started, this.#index))
                }
                return;
            }


            if (started === -1) {
                started = this.#index;
            }

            char = this.#next();
        }

        if (started != -1) {
            this.#addToken(MarkdownTokenType.Text, this.#body.substring(started, this.#index), started)
        }
    }

    parse(): void {
        let char = this.#current();

        while (char !== "") {
            this.#tokenStart = this.#index;

            if (char === " " || char === "\t") {
                this.#whiteSpace();
            } else if (char === "#") {
                this.#header();
            } else if (char === "\n") {
                this.#inc();
                this.#addToken(MarkdownTokenType.NewLine, "\n");
            } else if (char === "*") {
                this.#inc();
                this.#addToken(MarkdownTokenType.Star, "*");
            } else if (char === "`") {
                this.#inc();
                this.#addToken(MarkdownTokenType.BackTick, "`");
            } else {
                this.#text();
            }

            char = this.#current();
        }
    }
}
