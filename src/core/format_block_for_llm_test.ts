import { describe, it } from "@std/testing/bdd";
import { assertEquals } from "@std/assert";
import { fromMarkdown } from "mdast-util-from-markdown";
import type { RootContent } from "mdast";
import { formatBlockForLlm } from "./format_block_for_llm.ts";

describe("formatBlockForLlm", () => {
  it("returns content when block content is short", () => {
    const markdown = "Hello World";
    const ast = fromMarkdown(markdown);
    const block = ast.children[0] as RootContent;

    const result = formatBlockForLlm({ id: 0, block, markdown });

    assertEquals(result, {
      id: 0,
      type: block.type,
      content: "Hello World",
    });
  });

  it("returns preview and length when block content exceeds preview limit", () => {
    const longContent = "a".repeat(90);
    const markdown = longContent;
    const ast = fromMarkdown(markdown);
    const block = ast.children[0] as RootContent;

    const result = formatBlockForLlm({ id: 1, block, markdown });

    assertEquals(result, {
      id: 1,
      type: block.type,
      preview: longContent.slice(0, 80),
      length: 90,
    });
  });
});
