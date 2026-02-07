import { describe, it } from "@std/testing/bdd";
import { assertEquals } from "@std/assert";
import { MarkdownDocument } from "./markdown_document.ts";

describe("MarkdownDocument", () => {
  it("should split markdown into sections", () => {
    const document = new MarkdownDocument({
      id: 0,
      text: "# Heading\n\nBlock\n\n## Subheading\n\nBlock",
    });
    const sections = document.sections.map((v) => ({
      heading: v.heading.content,
      blocks: v.content.map((v) => v.content),
    }));

    assertEquals(sections, [
      {
        heading: "# Heading",
        blocks: ["Block"],
      },
      {
        heading: "## Subheading",
        blocks: ["Block"],
      },
    ]);
  });

  it("should split markdown without headings into sections", () => {
    const document = new MarkdownDocument({
      id: 0,
      text: "Block 1\n\nBlock 2",
    });
    const sections = document.sections.map((v) => ({
      heading: v.heading.content,
      blocks: v.content.map((v) => v.content),
    }));

    assertEquals(sections, [
      {
        heading: "",
        blocks: ["Block 1", "Block 2"],
      },
    ]);
  });
});
