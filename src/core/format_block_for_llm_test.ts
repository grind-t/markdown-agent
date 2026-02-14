// deno-lint-ignore-file no-explicit-any
import { describe, it } from "@std/testing/bdd";
import { assertEquals } from "@std/assert";
import { formatBlockForLLM } from "./format_block_for_llm.ts";

describe("formatBlockForLLM", () => {
  it("returns full content when length is below preview limit", () => {
    const markdown = "short content";
    const block = {
      position: { start: { offset: 0 }, end: { offset: markdown.length } },
    } as any;

    const got = formatBlockForLLM({ markdown, block, index: 0 });
    assertEquals(got, markdown);
  });

  it("returns preview and comment when content exceeds preview limit", () => {
    const content = "a".repeat(100);
    const markdown = content;
    const block = {
      position: { start: { offset: 0 }, end: { offset: markdown.length } },
    } as any;

    const got = formatBlockForLLM({ markdown, block, index: 3 });
    const preview = content.slice(0, 80);
    const expected = `${preview}...\n<!-- id: 3, length: ${content.length} -->`;

    assertEquals(got, expected);
  });
});
