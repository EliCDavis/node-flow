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

    #lastToken = 0;
    
    #addToken(token: MarkdownTokenType, lexeme: string): void {
        this.#tokens.push(new MarkdownToken(token, lexeme, this.#lastToken, this.#index));
        this.#lastToken = this.#index;
    }

    #h2(): void {
        let char = this.#next();
        if (char === "#") {
            this.#addToken(MarkdownTokenType.H3, "###");

            // Move it off the character for the next reading
            this.#inc();
        } else {
            this.#addToken(MarkdownTokenType.H2, "##");
        }
    }

    #h1(): void {
        let char = this.#next();
        if (char === "#") {
            this.#h2();
        } else {
            this.#addToken(MarkdownTokenType.H1, "#");
        }
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
            this.#addToken(MarkdownTokenType.Text, this.#body.substring(started, this.#index))
        }
    }

    // S( ) => S
    // S(\t) => S
    // S(#) => H1
    // H1(#) => H2
    // H1(!#) => S
    // H2(#) => H3
    // H2(#) => H3
    parse(): void {
        let char = this.#current();

        while (char !== "") {
            if (char === " " || char === "\t") {
                this.#whiteSpace();
            } else if (char === "#") {
                this.#h1();
            } else if (char === "\n") {
                this.#addToken(MarkdownTokenType.NewLine, "\n");
                this.#inc();
            } else if (char === "*") {
                this.#addToken(MarkdownTokenType.Star, "*");
                this.#inc();
            } else if (char === "`") {
                this.#addToken(MarkdownTokenType.BackTick, "`");
                this.#inc();
            } else {
                this.#text();
            }

            char = this.#current();
        }
    }
}
