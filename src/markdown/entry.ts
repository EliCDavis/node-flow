import { Theme } from "../theme";
import { List } from "../types/list";
import { Text } from "../types/text";
import { CopyVector2, Vector2 } from "../types/vector2";

export interface MarkdownEntry {
    render(ctx: CanvasRenderingContext2D, position: Vector2, scale: number, maxWidth: number): number
}

export class UnorderedListMarkdownEntry {

    #entries: Array<BasicMarkdownEntry>;

    constructor(entries: Array<BasicMarkdownEntry>) {
        this.#entries = entries;
    }

    render(ctx: CanvasRenderingContext2D, position: Vector2, scale: number, maxWidth: number): number {
        let offset = 0;
        let shift = 20;

        let pos = {
            x: position.x + (shift * scale),
            y: position.y
        }

        let dot = Theme.Note.DotSize * scale;

        for (let i = 0; i < this.#entries.length; i++) {

            ctx.beginPath();
            ctx.arc(position.x + dot, pos.y + (dot * 3), dot, 0, 2 * Math.PI);
            ctx.fill();

            offset += this.#entries[i].render(ctx, pos, scale, maxWidth - shift) + (scale * Theme.Note.LineSpacing * 2);
            pos.y = position.y + offset;
        }

        return offset;
    }
}

export class BasicMarkdownEntry {

    #underline: boolean;

    #entries: Array<Text>

    #calculatedPositions: List<Vector2>

    #calculatedEntries: List<Text>

    #calculatedForWidth: number;

    constructor(lines: Array<Text>, underline: boolean) {
        this.#entries = lines;
        this.#underline = underline;
        this.#calculatedForWidth = -1

        this.#calculatedEntries = new List<Text>();
        this.#calculatedPositions = new List<Vector2>();

        document.fonts.addEventListener("loadingdone", (event) => {
            this.#calculatedForWidth = -1
        });
    }

    #calculateLayout(ctx: CanvasRenderingContext2D, maxWidth: number): void {
        if (this.#calculatedForWidth === maxWidth) {
            return;
        }
        this.#calculatedEntries.Clear();
        this.#calculatedPositions.Clear();

        const curPosition: Vector2 = { x: 0, y: 0 };
        const texSize: Vector2 = { x: 0, y: 0 };

        let currentLineHeight = 0;
        const currentLineText = new List<Text>();
        const currentLineWidths = new List<number>();


        for (let entryIndex = 0; entryIndex < this.#entries.length; entryIndex++) {
            const entry = this.#entries[entryIndex];

            let lines = entry.splitAtWidth(ctx, maxWidth - curPosition.x);
            let i = 0;
            while (lines.length > 1 && i < 100) {
                i++

                // We can't collapse this thing any further. Break out of the 
                // while loop before we have infinite loop on our hands
                // if (lines[0].get() === "" && lines[1].get().length === 1) {
                //     lines[0] = lines[1];
                //     break;
                // }

                // We can't collapse this thing any further. Break out of the 
                // while loop before we have infinite loop on our hands
                if (lines[0].get() === "" && currentLineText.Count() === 0) {

                    if (lines[1].get().length === 1) {
                        lines[0] = lines[1];
                        break;
                    } else {
                        lines = lines[1].splitAtIndex(1);
                    }

                }

                // This effectiviely finishes off the line we're currenly working on.
                if (lines[0].get() !== "") {
                    lines[0].size(ctx, 1, texSize);
                    currentLineHeight = Math.max(currentLineHeight, texSize.y);

                    currentLineText.Push(lines[0]);
                    currentLineWidths.Push(curPosition.x);
                }

                curPosition.y += currentLineHeight;

                // Take everything we're working with and finalize it
                for (let i = 0; i < currentLineText.Count(); i++) {
                    this.#calculatedEntries.Push(currentLineText.At(i));
                    this.#calculatedPositions.Push({ x: currentLineWidths.At(i), y: curPosition.y })
                }

                currentLineText.Clear();
                currentLineWidths.Clear();

                curPosition.y += Theme.Note.LineSpacing;
                currentLineHeight = 0;
                curPosition.x = 0;

                lines = lines[1].splitAtWidth(ctx, maxWidth);
            }
            if (i === 100) {
                console.log(lines)
            }

            lines[0].size(ctx, 1, texSize);
            currentLineHeight = Math.max(currentLineHeight, texSize.y)

            currentLineText.Push(lines[0]);
            currentLineWidths.Push(curPosition.x);

            curPosition.x += texSize.x;
        }

        curPosition.y += currentLineHeight;

        // Take everything we're working with and finalize it
        for (let i = 0; i < currentLineText.Count(); i++) {
            this.#calculatedEntries.Push(currentLineText.At(i));
            this.#calculatedPositions.Push({ x: currentLineWidths.At(i), y: curPosition.y })
        }

        this.#calculatedForWidth = maxWidth;
    }

    render(ctx: CanvasRenderingContext2D, position: Vector2, scale: number, maxWidth: number): number {
        this.#calculateLayout(ctx, maxWidth);

        let max = 0;
        for (let i = 0; i < this.#calculatedEntries.Count(); i++) {
            const entry = this.#calculatedEntries.At(i);
            const pos = this.#calculatedPositions.At(i);

            entry.render(ctx, scale, {
                x: (pos.x * scale) + position.x,
                y: (pos.y * scale) + position.y
            });

            max = Math.max(max, pos.y * scale)
        }

        // Add underline 
        if (this.#underline) {
            const y = position.y + max + (scale * 5)
            ctx.strokeStyle = Theme.Note.FontColor;
            ctx.lineWidth = Theme.Note.HeaderLineWidth * scale;
            ctx.beginPath();
            ctx.moveTo(position.x, y);
            ctx.lineTo(position.x + (maxWidth * scale), y);
            ctx.stroke();
        }

        return max;
    }
}