import { FontStyle, FontWeight, TextStyleConfig } from "../styles/text";
import { Theme } from "../theme";
import { Text } from "../types/text";
import { BasicMarkdownEntry, CodeBlockEntry, MarkdownEntry, UnorderedListMarkdownEntry } from "./entry";
import { MarkdownToken, MarkdownTokenType } from "./token";

export class MarkdownSyntaxParser {

    #tokens: Array<MarkdownToken>;

    #index: number;

    #originalText: string;

    constructor(originalText: string, tokens: Array<MarkdownToken>) {
        this.#originalText = originalText;
        this.#index = 0;
        this.#tokens = tokens;
    }

    #current(): MarkdownToken | null {
        if (this.#index > this.#tokens.length - 1) {
            return null
        }
        return this.#tokens[this.#index];
    }

    #inc(): void {
        this.#index++
    }

    #next(): MarkdownToken | null {
        this.#index++
        if (this.#index >= this.#tokens.length - 1) {
            return null
        }
        return this.#tokens[this.#index];
    }

    #peak(): MarkdownToken | null {
        if (this.#index + 1 >= this.#tokens.length - 1) {
            return null
        }
        return this.#tokens[this.#index + 1];
    }

    #peakInto(amount: number): MarkdownToken | null {
        if (this.#index + amount >= this.#tokens.length - 1) {
            return null
        }
        return this.#tokens[this.#index + amount];
    }

    #emphasis(): Array<Text> {

        // Cases to consider
        // =================
        // 1.  *a*:      <i>a</i>
        // 2.  **a**:    <b>a</b>
        // 3.  **a*:     *<i>a</i> <----- fuck this one
        // 4.  ***a**:   *<b>a</b> <----- fuck this one
        // 5.  *a**:     <i>a</i>*
        // 6.  **a***:   <b>a</b>*
        // 7.  * a *:    * a *
        // 8.  ** a **:  ** a **
        // 9.  **a **:   **a **
        // 10. **a f**:  <b>a f<b>
        // 11. * Test:   <ul>Test</ul> 

        let token = this.#next();
        if (token?.type() === MarkdownTokenType.Space) {
            return [new Text("*")];
        }

        let bold = false;
        // Read off all leading stars
        while (token !== null && token.type() === MarkdownTokenType.Star) {
            bold = true;
            token = this.#next();
        }

        let textContent = "";

        let boldClosed = false;
        let startingClose = false;
        let validClose = false;
        while (token !== null && token.type() !== MarkdownTokenType.NewLine) {
            if (token.type() === MarkdownTokenType.Star) {

                // This is the second star we've seen in a row. We're done!
                if (startingClose) {
                    boldClosed = true;
                    break;
                }

                // If we're not bold, we just need a single star to close this off.
                startingClose = true;
                if (bold === false) {
                    break;
                }
            }

            if (startingClose && token.type() !== MarkdownTokenType.Star) {
                break;
            }

            // Add to string content...
            if (token.type() === MarkdownTokenType.Text) {
                textContent += token.lexeme();
                validClose = true;
            }

            if (token.type() === MarkdownTokenType.Space) {
                textContent += token.lexeme();
                validClose = false;
            }

            token = this.#next();
        }

        const style: TextStyleConfig = {}

        if (validClose && startingClose) {
            if (boldClosed) {
                style.weight = FontWeight.Bold;
            } else {
                style.style = FontStyle.Italic;
            }
        }

        return [new Text(textContent, style)]
    }

    #text(): Array<Text> {
        let contents: Array<Text> = new Array<Text>();
        let textContent = "";

        let token = this.#current();

        // Read off all starting whitespace 
        while (token !== null && token.type() === MarkdownTokenType.Space) {
            token = this.#next();
        }

        while (token !== null && token.type() !== MarkdownTokenType.NewLine) {
            switch (token.type()) {
                case MarkdownTokenType.Text:
                case MarkdownTokenType.H1:
                case MarkdownTokenType.H2:
                case MarkdownTokenType.H3:
                case MarkdownTokenType.Text:
                case MarkdownTokenType.Space:
                    textContent += token.lexeme();
                    break;

                case MarkdownTokenType.Star:
                    if (textContent !== "") {
                        contents.push(new Text(textContent))
                        textContent = "";
                    }
                    let starText = this.#emphasis()
                    for (let i = 0; i < starText.length; i++) {
                        contents.push(starText[i]);
                    }
                    break;
            }

            token = this.#next();
        }

        if (textContent !== "") {
            contents.push(new Text(textContent))
        }

        return contents;
    }

    #h1(): BasicMarkdownEntry {
        // Move off of the header token
        this.#inc();

        const text = this.#text();
        for (let i = 0; i < text.length; i++) {
            text[i].setColor(Theme.Note.FontColor);
            text[i].setSize(Theme.Note.H1.FontSize);
            text[i].setWeight(FontWeight.Bold);
        }

        return new BasicMarkdownEntry(text, true, false);
    }

    #h2(): BasicMarkdownEntry {
        // Move off of the header token
        this.#inc();

        const text = this.#text();
        for (let i = 0; i < text.length; i++) {
            text[i].setColor(Theme.Note.FontColor);
            text[i].setSize(Theme.Note.H2.FontSize);
            text[i].setWeight(FontWeight.Bold);
        }

        return new BasicMarkdownEntry(text, true, false);
    }

    #h3(): BasicMarkdownEntry {
        // Move off of the header token
        this.#inc();

        const text = this.#text();
        for (let i = 0; i < text.length; i++) {
            text[i].setColor(Theme.Note.FontColor);
            text[i].setSize(Theme.Note.H3.FontSize);
            text[i].setWeight(FontWeight.Bold);
        }

        return new BasicMarkdownEntry(text, false, false);
    }

    #starLineStart(): MarkdownEntry {
        if (this.#peak()?.type() !== MarkdownTokenType.Space) {
            const starEntries = this.#text();
            this.#assignStandardStyling(starEntries);
            return new BasicMarkdownEntry(starEntries, false, false);
        }

        // We've begun with a space, which means unordered list!

        const entries = new Array<BasicMarkdownEntry>();

        while (this.#current()?.type() === MarkdownTokenType.Star && this.#peak()?.type() === MarkdownTokenType.Space) {
            this.#inc();
            const starEntries = this.#text();
            this.#assignStandardStyling(starEntries);
            entries.push(new BasicMarkdownEntry(starEntries, false, false));

            // Text reads to the end of the line, which means we're at the new
            // line character. Move forward 1. 
            this.#inc();
        }

        return new UnorderedListMarkdownEntry(entries);

    }

    #assignStandardStyling(textEntries: Array<Text>): void {
        for (let i = 0; i < textEntries.length; i++) {
            textEntries[i].setColor(Theme.Note.FontColor);
            textEntries[i].setSize(Theme.Note.FontSize);
        }
    }

    #backtickLineStart(): MarkdownEntry {

        // If we're not a ```, just treat as regular text
        if (this.#peak()?.type() !== MarkdownTokenType.BackTick || this.#peakInto(2)?.type() !== MarkdownTokenType.BackTick) {
            const starEntries = this.#text();
            this.#assignStandardStyling(starEntries);
            return new BasicMarkdownEntry(starEntries, false, false);
        }
        this.#inc();
        this.#inc();

        let token = this.#next();

        // Eat the first new line character
        if (token?.type() === MarkdownTokenType.NewLine) {
            token = this.#next();
        }

        let start = token?.tokenStart();
        let end = start;

        // Read until we hit another ``` 
        while (token !== null) {

            if (
                token.type() === MarkdownTokenType.BackTick &&
                this.#peak()?.type() === MarkdownTokenType.BackTick &&
                this.#peakInto(2)?.type() === MarkdownTokenType.BackTick
            ) {
                end = token.tokenEnd() - 1;
                break;
            }

            token = this.#next();
        }

        this.#inc(); // puts us on the 2nd
        this.#inc(); // puts us on the 3rd
        this.#inc(); // puts us on the next token

        const codeBlockText = this.#originalText.substring(start as number, end);
        const entryText = new Text(codeBlockText);
        this.#assignStandardStyling([entryText])
        return new CodeBlockEntry(entryText)
    }

    parse(): Array<MarkdownEntry> {
        let token = this.#current();

        const entries = new Array<MarkdownEntry>();

        while (token !== null) {
            switch (token.type()) {
                case MarkdownTokenType.H1:
                    entries.push(this.#h1());
                    break;

                case MarkdownTokenType.H2:
                    entries.push(this.#h2());
                    break;

                case MarkdownTokenType.H3:
                    entries.push(this.#h3());
                    break;

                case MarkdownTokenType.Text:
                    const textEntries = this.#text();
                    this.#assignStandardStyling(textEntries);
                    entries.push(new BasicMarkdownEntry(textEntries, false, false));
                    break;

                case MarkdownTokenType.Star:
                    entries.push(this.#starLineStart());
                    break;

                case MarkdownTokenType.NewLine:
                    this.#inc();
                    break;

                case MarkdownTokenType.BackTick:
                    entries.push(this.#backtickLineStart());
                    break;

                default:
                    this.#inc();
            }

            token = this.#current();
        }

        return entries;
    }
}
