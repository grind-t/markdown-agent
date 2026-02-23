// deno-lint-ignore-file no-explicit-any
import { describe, it } from "@std/testing/bdd";
import { assertEquals } from "@std/assert";
import { DocumentSlice } from "./document_slice.ts";
import { unfoldDocument } from "./unfold_document.ts";

function makeRoot(children: any[] = []) {
  return { type: "root", children } as any;
}

describe("unfoldDocument", () => {
  it("falls back to unfoldRoot when input slice is empty", () => {
    const root = makeRoot([
      { type: "heading", depth: 1, children: [] }, // 0
      { type: "paragraph", children: [] }, // 1
      { type: "heading", depth: 1, children: [] }, // 2
      { type: "paragraph", children: [] }, // 3
    ]);
    const slice = new DocumentSlice(root, []);

    const unfolded = unfoldDocument(slice);

    assertEquals(unfolded.indices, [0, 2]);
  });

  it("unfolds sections from selected deepest headings and keeps sorted unique indices", () => {
    const root = makeRoot([
      { type: "heading", depth: 1, children: [] }, // 0
      { type: "paragraph", children: [] }, // 1
      { type: "heading", depth: 2, children: [] }, // 2
      { type: "paragraph", children: [] }, // 3
      { type: "heading", depth: 2, children: [] }, // 4
      { type: "heading", depth: 1, children: [] }, // 5
    ]);
    const slice = new DocumentSlice(root, [0, 2, 4]);

    const unfolded = unfoldDocument(slice);

    assertEquals(unfolded.indices, [0, 2, 3, 4]);
  });
});
