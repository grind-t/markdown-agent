import { fromMarkdown } from "mdast-util-from-markdown";
import type { Root } from "mdast";
import { MarkdownSection } from "./markdown_section.ts";
import { MarkdownBlock } from "./markdown_block.ts";
import { EMPTY_HEADING } from "./empty_heading.ts";

export class MarkdownDocument {
  readonly ast: Root;
  readonly sections: MarkdownSection[];

  constructor(readonly text: string) {
    this.ast = fromMarkdown(text);
    this.sections = [];

    if (!this.ast.children.length) {
      return;
    }

    if (this.ast.children[0].type !== "heading") {
      this.ast.children.unshift(EMPTY_HEADING);
    }

    for (let i = 0; i < this.ast.children.length;) {
      const heading = new MarkdownBlock({
        id: 0,
        node: this.ast.children[i],
        fullDocument: text,
      });
      const content: MarkdownBlock[] = [];

      for (i = i + 1; i < this.ast.children.length; i++) {
        const node = this.ast.children[i];

        if (node.type === "heading") {
          break;
        }

        content.push(
          new MarkdownBlock({
            id: content.length + 1,
            node,
            fullDocument: text,
          }),
        );
      }

      this.sections.push(
        new MarkdownSection({
          id: this.sections.length,
          heading,
          content,
        }),
      );
    }
  }
}
