import { describe, it } from "@std/testing/bdd";
import { assertEquals } from "@std/assert";
import type { Text } from "mdast";
import { getBlockString } from "./get_block_string.ts";

describe("getBlockString", () => {
  it("extracts string at document start", () => {
    const markdown = "Hello\nWorld";
    const start = 0;
    const end = 5; // "Hello"

    const block = {
      type: "text",
      value: markdown.slice(start, end),
      position: {
        start: { line: 1, column: start + 1, offset: start },
        end: { line: 1, column: end + 1, offset: end },
      },
    } as Text;

    assertEquals(getBlockString(markdown, block), "Hello");
  });

  it("extracts string in the middle of the document", () => {
    const markdown = "Line1\nLine2\nLine3";
    const start = 6; // start of "Line2"
    const end = 11; // end of "Line2"

    const block = {
      type: "text",
      value: markdown.slice(start, end),
      position: {
        start: { line: 2, column: 1, offset: start },
        end: { line: 2, column: end - start + 1, offset: end },
      },
    } as Text;

    assertEquals(getBlockString(markdown, block), "Line2");
  });

  it("extracts string when block spans entire document", () => {
    const markdown = "Full document content";
    const start = 0;
    const end = markdown.length;

    const block = {
      type: "text",
      value: markdown,
      position: {
        start: { line: 1, column: 1, offset: start },
        end: { line: 1, column: end + 1, offset: end },
      },
    } as Text;

    assertEquals(getBlockString(markdown, block), "Full document content");
  });

  it("returns empty string for zero-length block", () => {
    const markdown = "Some text";
    const start = 5;
    const end = 5;

    const block = {
      type: "text",
      value: "",
      position: {
        start: { line: 1, column: start + 1, offset: start },
        end: { line: 1, column: end + 1, offset: end },
      },
    } as Text;

    assertEquals(getBlockString(markdown, block), "");
  });

  it("extracts string at document end", () => {
    const markdown = "prefixsuffix";
    const start = 6; // start of "suffix"
    const end = markdown.length;

    const block = {
      type: "text",
      value: markdown.slice(start, end),
      position: {
        start: { line: 1, column: start + 1, offset: start },
        end: { line: 1, column: end + 1, offset: end },
      },
    } as Text;

    assertEquals(getBlockString(markdown, block), "suffix");
  });
});
