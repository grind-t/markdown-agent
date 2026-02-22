import { describe, it } from "@std/testing/bdd";
import { assertEquals } from "@std/assert";
import { fromMarkdown } from "mdast-util-from-markdown";
import { DocumentSlice } from "./document_slice.ts";
import { getDocumentPreview } from "./get_document_preview.ts";

function renderPreview(markdown: string, indices: number[]): string {
  const ast = fromMarkdown(markdown);
  const slice = new DocumentSlice(ast);

  for (const index of indices) {
    slice.addBlock(index);
  }

  return getDocumentPreview({ markdown, slice });
}

describe("getDocumentPreview depth=1", () => {
  it("renders last-level heading metadata and short paragraph", () => {
    const markdown = "# Title\n\nShort paragraph.";

    const result = renderPreview(markdown, [0, 1]);

    assertEquals(
      result,
      "# Title\n\n<!-- id: 0, length: 16 -->\n\nShort paragraph.\n<!-- id: 1 -->",
    );
  });

  it("truncates a paragraph longer than 80 chars", () => {
    const long = "a".repeat(81);
    const markdown = `# T\n\n${long}`;

    const result = renderPreview(markdown, [0, 1]);

    assertEquals(
      result,
      `# T\n\n<!-- id: 0, length: 81 -->\n\n${"a".repeat(80)}...\n<!-- id: 1, length: 81 -->`,
    );
  });
});

describe("getDocumentPreview depth=2", () => {
  it("renders non-last and last-level headings correctly", () => {
    const markdown = "# H1\n\n## H2\n\nBody.";

    const result = renderPreview(markdown, [0, 1, 2]);

    assertEquals(
      result,
      "# H1\n\n## H2\n\n<!-- id: 1, length: 5 -->\n\nBody.\n<!-- id: 2 -->",
    );
  });

  it("does not truncate long non-heading before reaching last level", () => {
    const intro = "b".repeat(90);
    const markdown = `${intro}\n\n# H1\n\n## H2`;

    const result = renderPreview(markdown, [0, 1, 2]);

    assertEquals(
      result,
      `${intro}\n<!-- id: 0 -->\n\n# H1\n\n## H2\n\n<!-- id: 2, length: 0 -->`,
    );
  });
});

describe("getDocumentPreview depth=3", () => {
  it("renders heading ladder and deepest section preview", () => {
    const markdown = "# H1\n\n## H2\n\n### H3\n\nDeep.";

    const result = renderPreview(markdown, [0, 1, 2, 3]);

    assertEquals(
      result,
      "# H1\n\n## H2\n\n### H3\n\n<!-- id: 2, length: 5 -->\n\nDeep.\n<!-- id: 3 -->",
    );
  });

  it("truncates only when block is at current last level", () => {
    const intro = "c".repeat(90);
    const deep = "d".repeat(81);
    const markdown = `${intro}\n\n# H1\n\n## H2\n\n### H3\n\n${deep}`;

    const result = renderPreview(markdown, [0, 1, 2, 3, 4]);

    assertEquals(
      result,
      `${intro}\n<!-- id: 0 -->\n\n# H1\n\n## H2\n\n### H3\n\n<!-- id: 3, length: 81 -->\n\n${"d".repeat(80)}...\n<!-- id: 4, length: 81 -->`,
    );
  });
});
