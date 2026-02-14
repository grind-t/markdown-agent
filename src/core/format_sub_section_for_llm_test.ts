// deno-lint-ignore-file no-explicit-any
import { describe, it } from "@std/testing/bdd";
import { assertEquals } from "@std/assert";
import { formatSubSectionForLLM } from "./format_sub_section_for_llm.ts";

describe("formatSubSectionForLLM", () => {
  it("formats a heading with no content", () => {
    const markdown = "# Title\n";
    const h0 = {
      type: "heading",
      depth: 1,
      children: [],
      position: { start: { offset: 0 }, end: { offset: 7 } },
    } as any;

    const root = { type: "root", children: [h0] } as any;

    const got = formatSubSectionForLLM({
      markdown,
      ast: root,
      headingIndex: 0,
    });
    const expected = markdown.slice(0, 7) + "\n\n<!-- id: 0, length: 0 -->";

    assertEquals(got, expected);
  });

  it("includes heading content and correct section length when there is a paragraph", () => {
    const markdown = "## H\n\npara\n\n# Next";

    const h0 = {
      type: "heading",
      depth: 2,
      children: [],
      position: { start: { offset: 0 }, end: { offset: 4 } },
    } as any;

    const p = {
      type: "paragraph",
      children: [],
      position: { start: { offset: 6 }, end: { offset: 10 } },
    } as any;

    const h1 = {
      type: "heading",
      depth: 1,
      children: [],
      position: { start: { offset: 12 }, end: { offset: 17 } },
    } as any;

    const root = { type: "root", children: [h0, p, h1] } as any;

    const got = formatSubSectionForLLM({
      markdown,
      ast: root,
      headingIndex: 0,
    });

    const headingContent = markdown.slice(0, 4); // "## H"
    const expected = `${headingContent}\n\n<!-- id: 0, length: 4 -->`;

    assertEquals(got, expected);
  });
});
