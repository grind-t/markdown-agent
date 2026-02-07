import { MarkdownBlock } from "./markdown_block.ts";
import { describe, it } from "@std/testing/bdd";
import { assertEquals } from "@std/assert";
import type { Text } from "mdast";

const fullDocument =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam neque lectus, dapibus consequat massa sit amet, pellentesque laoreet orci. Morbi.";

const getTextNode = (start: number, end: number): Text => ({
  type: "text",
  value: fullDocument.slice(start, end),
  position: {
    start: {
      line: 1,
      column: start + 1,
      offset: start,
    },
    end: {
      line: 1,
      column: end + 1,
      offset: end,
    },
  },
});

const shortBlock = new MarkdownBlock({
  id: 0,
  node: getTextNode(12, 26),
  fullDocument: fullDocument,
});

const longBlock = new MarkdownBlock({
  id: 1,
  node: getTextNode(0, fullDocument.length),
  fullDocument: fullDocument,
});

describe("MarkdownBlock", () => {
  it("should have correct type", () => {
    assertEquals(shortBlock.type, "text");
  });

  it("should have correct document offset", () => {
    assertEquals(shortBlock.docOffset, 12);
  });

  it("should have correct length", () => {
    assertEquals(shortBlock.length, 14);
  });

  it("should have correct content", () => {
    assertEquals(shortBlock.content, "dolor sit amet");
  });

  it("should return preview for long block", () => {
    assertEquals(
      longBlock.getPreview(),
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam neque lectus, dapib...",
    );
  });

  it("should not return preview for short block", () => {
    assertEquals(shortBlock.getPreview(), undefined);
  });
});
