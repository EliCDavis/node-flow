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
        if (this.#index >= this.#tokens.length) {
            return null
        }
        return this.#tokens[this.#index];
    }

    #peak(): MarkdownToken | null {
        return this.#peakInto(1);
    }

    #peakInto(amount: number): MarkdownToken | null {
        if (this.#index + amount >= this.#tokens.length) {
            return null
        }
        return this.#tokens[this.#index + amount];
    }

    #emphasis(): Array<Text> {

        // Count the stars either side of the content and match as many as
        // both ends can supply; the rest stay on the line as characters.
        //
        // *a*     -> <i>a</i>          **a*    -> *<i>a</i>
        // **a**   -> <b>a</b>          *a**    -> <i>a</i>*
        // **a f** -> <b>a f</b>        *a      -> *a
        // ** a ** -> ** a **           **a **  -> **a **

        // A star with a space after it opens nothing, so leave the space
        // where it is rather than consuming it - the caller still has to
        // read it as part of the line.
        if (this.#peak()?.type() === MarkdownTokenType.Space) {
            return [new Text("*")];
        }

        const openers = this.#runOfStars();

        let content = "";
        let closers = 0;
        while (true) {
            const token = this.#current();
            if (token === null || token.type() === MarkdownTokenType.NewLine) {
                break;
            }
            if (token.type() === MarkdownTokenType.Star) {
                closers = this.#runOfStars();
                break;
            }
            content += token.lexeme();
            this.#inc();
        }

        // Leave the reader on the last token taken, since the caller steps
        // forward once more before looking at anything.
        this.#index--;

        // A run of stars only emphasises what it hugs. With a space against
        // the inside of either end, or nothing between them at all, the
        // stars are just stars.
        const hugsContent = content !== ""
            && content.trimStart() === content
            && content.trimEnd() === content;

        const matched = hugsContent ? Math.min(openers, closers) : 0;
        if (matched === 0) {
            return [new Text("*".repeat(openers) + content + "*".repeat(closers))];
        }

        const style: TextStyleConfig = {};
        if (matched >= 2) {
            style.weight = FontWeight.Bold;
        } else {
            style.style = FontStyle.Italic;
        }

        // Stars past the pair that matched were never part of the emphasis,
        // so they stay on the line as the characters they are.
        const runs = new Array<Text>();
        if (openers > matched) {
            runs.push(new Text("*".repeat(openers - matched)));
        }
        runs.push(new Text(content, style));
        if (closers > matched) {
            runs.push(new Text("*".repeat(closers - matched)));
        }
        return runs;
    }

    /** Consumes a run of stars, leaving the reader on the token after it. */
    #runOfStars(): number {
        let count = 0;
        while (this.#current()?.type() === MarkdownTokenType.Star) {
            count++;
            this.#inc();
        }
        return count;
    }

    /**
     * Reads `code` up to the closing backtick on the same line. An opening
     * backtick with no partner is only a backtick.
     */
    #inlineCode(): Array<Text> {
        const opened = this.#index;

        this.#inc();
        let content = "";
        while (true) {
            const token = this.#current();
            if (token === null || token.type() === MarkdownTokenType.NewLine) {
                this.#index = opened;
                return [new Text("`")];
            }
            if (token.type() === MarkdownTokenType.BackTick) {
                break;
            }
            content += token.lexeme();
            this.#inc();
        }

        return [new Text(content, { font: "monospace" })];
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
                case MarkdownTokenType.Space:
                    textContent += token.lexeme();
                    break;

                case MarkdownTokenType.Star:
                case MarkdownTokenType.BackTick:
                    if (textContent !== "") {
                        contents.push(new Text(textContent))
                        textContent = "";
                    }
                    const runs = token.type() === MarkdownTokenType.Star
                        ? this.#emphasis()
                        : this.#inlineCode();
                    for (let i = 0; i < runs.length; i++) {
                        contents.push(runs[i]);
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
