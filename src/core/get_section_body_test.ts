// deno-lint-ignore-file no-explicit-any
import { describe, it } from "@std/testing/bdd";
import { assertEquals } from "@std/assert";
import { getSectionBody } from "./get_section_body.ts";

function makeRoot(children: any[] = []) {
  return { type: "root", children } as any;
}

describe("getSectionBody", () => {
  it("returns empty slice when heading is last block", () => {
    const root = makeRoot([
      { type: "heading", depth: 2, children: [] },
    ]);

    const slice = getSectionBody({ ast: root, headingIndex: 0 });

    assertEquals(slice.indices, []);
  });

  it("includes consecutive non-heading blocks until end of document", () => {
    const root = makeRoot([
      { type: "heading", depth: 1, children: [] }, // 0
      { type: "paragraph", children: [] }, // 1
      { type: "code", lang: null, meta: null, value: "x" }, // 2
      { type: "list", ordered: false, spread: false, children: [] }, // 3
    ]);

    const slice = getSectionBody({ ast: root, headingIndex: 0 });

    assertEquals(slice.indices, [1, 2, 3]);
  });

  it("stops before next heading of same depth", () => {
    const root = makeRoot([
      { type: "heading", depth: 2, children: [] }, // 0
      { type: "paragraph", children: [] }, // 1
      { type: "heading", depth: 2, children: [] }, // 2
      { type: "paragraph", children: [] }, // 3
    ]);

    const slice = getSectionBody({ ast: root, headingIndex: 0 });

    assertEquals(slice.indices, [1]);
  });

  it("stops before next heading of shallower depth", () => {
    const root = makeRoot([
      { type: "heading", depth: 3, children: [] }, // 0
      { type: "paragraph", children: [] }, // 1
      { type: "heading", depth: 2, children: [] }, // 2
      { type: "paragraph", children: [] }, // 3
    ]);

    const slice = getSectionBody({ ast: root, headingIndex: 0 });

    assertEquals(slice.indices, [1]);
  });

  it("includes deeper headings and their content within the same parent section", () => {
    const root = makeRoot([
      { type: "heading", depth: 1, children: [] }, // 0
      { type: "paragraph", children: [] }, // 1
      { type: "heading", depth: 2, children: [] }, // 2
      { type: "paragraph", children: [] }, // 3
      { type: "heading", depth: 3, children: [] }, // 4
      { type: "paragraph", children: [] }, // 5
      { type: "heading", depth: 1, children: [] }, // 6
    ]);

    const slice = getSectionBody({ ast: root, headingIndex: 0 });

    assertEquals(slice.indices, [1, 2, 3, 4, 5]);
  });

  it("for nested target heading, excludes parent-level siblings beyond boundary", () => {
    const root = makeRoot([
      { type: "heading", depth: 1, children: [] }, // 0
      { type: "paragraph", children: [] }, // 1
      { type: "heading", depth: 2, children: [] }, // 2
      { type: "paragraph", children: [] }, // 3
      { type: "heading", depth: 2, children: [] }, // 4
      { type: "paragraph", children: [] }, // 5
    ]);

    const slice = getSectionBody({ ast: root, headingIndex: 2 });

    assertEquals(slice.indices, [3]);
  });
});
