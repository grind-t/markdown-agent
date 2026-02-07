import { fromMarkdown } from "mdast-util-from-markdown";
import { MarkdownSection } from "./markdown_section.ts";
import { MarkdownBlock } from "./markdown_block.ts";
import { describe, it } from "@std/testing/bdd";
import { assertEquals } from "@std/assert";

const fullDocument = `
# Heading

Block 1

Block 2

Block 3
`;

const ast = fromMarkdown(fullDocument);

const section = new MarkdownSection({
  id: 0,
  heading: new MarkdownBlock({ id: 0, node: ast.children[0], fullDocument }),
  content: ast.children.slice(1).map((node, i) =>
    new MarkdownBlock({ id: i + 1, node, fullDocument })
  ),
});

describe("MarkdownSection", () => {
  it("should have correct content length", () => {
    assertEquals(section.contentLength, 25);
  });
});
