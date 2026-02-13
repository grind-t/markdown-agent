// deno-lint-ignore-file no-explicit-any
import { describe, it } from "@std/testing/bdd";
import { assertEquals } from "@std/assert";
import { iterSubHeadings } from "./iter_sub_headings.ts";

describe("iter_sub_headings", () => {
  it("yields nothing when there are no subheadings", () => {
    const h = { type: "heading", depth: 2, children: [] } as any;
    const p = { type: "paragraph", value: "p" } as any;
    const hSame = { type: "heading", depth: 2, children: [] } as any;

    const root = { type: "root", children: [h, p, hSame] } as any;

    const got = Array.from(iterSubHeadings({ ast: root, headingIndex: 0 }));
    assertEquals(got, []);
  });

  it("yields subheadings and their indices, skipping non-heading blocks", () => {
    const h = { type: "heading", depth: 2, children: [] } as any;
    const p1 = { type: "paragraph", value: "a" } as any;
    const h3 = { type: "heading", depth: 3, children: [] } as any;
    const p2 = { type: "paragraph", value: "b" } as any;
    const h4 = { type: "heading", depth: 4, children: [] } as any;
    const p3 = { type: "paragraph", value: "c" } as any;
    const hSame = { type: "heading", depth: 2, children: [] } as any;

    const root = {
      type: "root",
      children: [h, p1, h3, p2, h4, p3, hSame],
    } as any;

    const got = Array.from(iterSubHeadings({ ast: root, headingIndex: 0 }));
    assertEquals(got, [[h3, 2], [h4, 4]]);
  });

  it("respects the depth option (max depth difference)", () => {
    const h = { type: "heading", depth: 2, children: [] } as any;
    const h3 = { type: "heading", depth: 3, children: [] } as any;
    const h4 = { type: "heading", depth: 4, children: [] } as any;
    const hSame = { type: "heading", depth: 2, children: [] } as any;

    const root = { type: "root", children: [h, h3, h4, hSame] } as any;

    const got1 = Array.from(
      iterSubHeadings({ ast: root, headingIndex: 0, depth: 1 }),
    );
    assertEquals(got1, [[h3, 1]]);

    const got2 = Array.from(
      iterSubHeadings({ ast: root, headingIndex: 0, depth: 2 }),
    );
    assertEquals(got2, [[h3, 1], [h4, 2]]);

    const got0 = Array.from(
      iterSubHeadings({ ast: root, headingIndex: 0, depth: 0 }),
    );
    assertEquals(got0, []);
  });
});
