import { describe, it } from "@std/testing/bdd";
import { assertEquals } from "@std/assert";
import { fromMarkdown } from "mdast-util-from-markdown";
import { getDocumentDepth } from "./get_document_depth.ts";

describe("getDocumentDepth", () => {
  const cases = [
    {
      name: "returns h1 depth when single h1 has no body",
      markdown: "# H1",
      expected: 1,
    },
    {
      name: "counts h1 followed by non-heading as having body",
      markdown: "# H1\n\nBody.",
      expected: 2,
    },
    {
      name: "counts heading followed by deeper heading as having body",
      markdown: "# H1\n\n## H2",
      expected: 2,
    },
    {
      name: "does not increment when heading is followed by same or shallower heading",
      markdown: "# H1\n\n## H2\n\n### H3\n\n## H2b",
      expected: 3,
    },
    {
      name: "returns global max across mixed heading contributions",
      markdown: "Intro.\n\n# H1\n\n## H2\n\nText.\n\n### H3\n\n#### H4\n\nTail.",
      expected: 5,
    },
  ] as const;

  for (const testCase of cases) {
    it(testCase.name, () => {
      const ast = fromMarkdown(testCase.markdown);

      assertEquals(getDocumentDepth(ast.children), testCase.expected);
    });
  }
});
