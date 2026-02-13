// deno-lint-ignore-file no-explicit-any
import { describe, it } from "@std/testing/bdd";
import { assertEquals } from "@std/assert";
import { iterSectionBlocks } from "./iter_section_blocks.ts";

describe("iterSectionBlocks", () => {
  it("yields nothing when heading has no content", () => {
    const h0 = { type: "heading", depth: 2, children: [] } as any;
    const root = { type: "root", children: [h0] } as any;

    const got = Array.from(iterSectionBlocks({ ast: root, headingIndex: 0 }));
    assertEquals(got, []);
  });

  it("includes deeper headings and their content", () => {
    const h0 = { type: "heading", depth: 2, children: [] } as any;
    const p1 = { type: "paragraph", value: "p1" } as any;
    const h_deeper = { type: "heading", depth: 3, children: [] } as any;
    const p2 = { type: "paragraph", value: "p2" } as any;
    const h1 = { type: "heading", depth: 2, children: [] } as any;

    const root = { type: "root", children: [h0, p1, h_deeper, p2, h1] } as any;

    const got = Array.from(iterSectionBlocks({ ast: root, headingIndex: 0 }));
    assertEquals(got, [[p1, 1], [h_deeper, 2], [p2, 3]]);
  });

  it("stops when encountering a same-level heading", () => {
    const h0 = { type: "heading", depth: 2, children: [] } as any;
    const p = { type: "paragraph", value: "p" } as any;
    const h1 = { type: "heading", depth: 2, children: [] } as any;

    const root = { type: "root", children: [h0, p, h1] } as any;

    const got = Array.from(iterSectionBlocks({ ast: root, headingIndex: 0 }));
    assertEquals(got, [[p, 1]]);
  });

  it("stops when encountering a higher-level heading", () => {
    const h0 = { type: "heading", depth: 2, children: [] } as any;
    const p = { type: "paragraph", value: "p" } as any;
    const hHigher = { type: "heading", depth: 1, children: [] } as any;
    const later = { type: "paragraph", value: "later" } as any;

    const root = { type: "root", children: [h0, p, hHigher, later] } as any;

    const got = Array.from(iterSectionBlocks({ ast: root, headingIndex: 0 }));
    assertEquals(got, [[p, 1]]);
  });
});
