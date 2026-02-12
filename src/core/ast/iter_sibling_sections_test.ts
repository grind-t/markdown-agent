// deno-lint-ignore-file no-explicit-any
import { describe, it } from "@std/testing/bdd";
import { assertEquals } from "@std/assert";
import { iterSiblingSections } from "./iter_sibling_sections.ts";

describe("iter_sibling_sections", () => {
  it("yields nothing for an empty AST", () => {
    const root = { type: "root", children: [] } as any;
    const got = Array.from(
      iterSiblingSections({ ast: root, startIndex: 0, level: 1 }),
    );
    assertEquals(got, []);
  });

  it("yields nothing when startIndex is not a heading", () => {
    const p = { type: "paragraph", value: "p" } as any;
    const h = { type: "heading", depth: 1, children: [] } as any;
    const root = { type: "root", children: [p, h] } as any;

    const got = Array.from(
      iterSiblingSections({ ast: root, startIndex: 0, level: 1 }),
    );
    assertEquals(got, []);
  });

  it("yields nothing when startIndex heading at different depth", () => {
    const h1 = { type: "heading", depth: 1, children: [] } as any;
    const h2 = { type: "heading", depth: 2, children: [] } as any;
    const root = { type: "root", children: [h1, h2] } as any;

    const got = Array.from(
      iterSiblingSections({ ast: root, startIndex: 0, level: 2 }),
    );
    assertEquals(got, []);
  });

  it("multiple sibling headings with content", () => {
    const h0 = { type: "heading", depth: 2, children: [] } as any;
    const c1 = { type: "paragraph", value: "p1" } as any;
    const h1 = { type: "heading", depth: 2, children: [] } as any;
    const c2 = { type: "paragraph", value: "p2" } as any;
    const c3 = { type: "heading", depth: 3, children: [] } as any;
    const h2 = { type: "heading", depth: 2, children: [] } as any;
    const c4 = { type: "paragraph", value: "p4" } as any;

    const root = {
      type: "root",
      children: [h0, c1, h1, c2, c3, h2, c4],
    } as any;

    const got = Array.from(
      iterSiblingSections({ ast: root, startIndex: 0, level: 2 }),
    );
    assertEquals(got, [
      { id: 0, heading: h0, content: [c1] },
      { id: 2, heading: h1, content: [c2, c3] },
      { id: 5, heading: h2, content: [c4] },
    ]);
  });

  it("multiple sibling headings with no content", () => {
    const h0 = { type: "heading", depth: 2, children: [] } as any;
    const h1 = { type: "heading", depth: 2, children: [] } as any;
    const h2 = { type: "heading", depth: 2, children: [] } as any;
    const root = { type: "root", children: [h0, h1, h2] } as any;

    const got = Array.from(
      iterSiblingSections({ ast: root, startIndex: 0, level: 2 }),
    );
    assertEquals(got, [
      { id: 0, heading: h0, content: [] },
      { id: 1, heading: h1, content: [] },
      { id: 2, heading: h2, content: [] },
    ]);
  });

  it("startIndex in middle of siblings", () => {
    const h0 = { type: "heading", depth: 2, children: [] } as any;
    const p0 = { type: "paragraph", value: "a" } as any;
    const h1 = { type: "heading", depth: 2, children: [] } as any;
    const p1 = { type: "paragraph", value: "b" } as any;
    const h2 = { type: "heading", depth: 2, children: [] } as any;
    const p2 = { type: "paragraph", value: "c" } as any;

    const root = { type: "root", children: [h0, p0, h1, p1, h2, p2] } as any;

    const got = Array.from(
      iterSiblingSections({ ast: root, startIndex: 2, level: 2 }),
    );
    assertEquals(got, [{ id: 2, heading: h1, content: [p1] }, {
      id: 4,
      heading: h2,
      content: [p2],
    }]);
  });

  it("stops when encountering a higher-level heading", () => {
    const h0 = { type: "heading", depth: 2, children: [] } as any;
    const p = { type: "paragraph", value: "p" } as any;
    const hHigher = { type: "heading", depth: 1, children: [] } as any;
    const hLater = { type: "heading", depth: 2, children: [] } as any;

    const root = {
      type: "root",
      children: [h0, p, hHigher, hLater],
    } as any;

    const got = Array.from(
      iterSiblingSections({ ast: root, startIndex: 0, level: 2 }),
    );
    assertEquals(got, [{ id: 0, heading: h0, content: [p] }]);
  });
});
