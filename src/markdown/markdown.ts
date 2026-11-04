import { MarkdownEntry } from "./entry";
import { MarkdownLexicalParser } from "./lexicalParser";
import { MarkdownSyntaxParser } from "./syntaxParser";

export function BuildMarkdown(data: string): Array<MarkdownEntry> {
    const lexicalParser = new MarkdownLexicalParser(data);
    lexicalParser.parse();
    // console.log(lexicalParser.tokens());

    const syntaxParser = new MarkdownSyntaxParser(data, lexicalParser.tokens());
    const contents = syntaxParser.parse()
    // console.log(contents);
    return contents;
}