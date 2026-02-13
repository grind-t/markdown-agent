// deno-lint-ignore-file no-explicit-any
import { describe, it } from "@std/testing/bdd";
import { assertEquals } from "@std/assert";
import { iterSectionBlocksFlat } from "./iter_section_blocks_flat.ts";

describe("iterSectionBlocksFlat", () => {
  it("yields nothing when heading has no content", () => {
    const h0 = { type: "heading", depth: 2, children: [] } as any;
    const root = { type: "root", children: [h0] } as any;

    const got = Array.from(
      iterSectionBlocksFlat({ ast: root, headingIndex: 0 }),
    );
    assertEquals(got, []);
  });

  it("stops at the next heading regardless of its depth", () => {
    const h0 = { type: "heading", depth: 2, children: [] } as any;
    const p1 = { type: "paragraph", value: "p1" } as any;
    const h_deeper = { type: "heading", depth: 3, children: [] } as any;
    const p2 = { type: "paragraph", value: "p2" } as any;
    const h1 = { type: "heading", depth: 2, children: [] } as any;

    const root = { type: "root", children: [h0, p1, h_deeper, p2, h1] } as any;

    const got = Array.from(
      iterSectionBlocksFlat({ ast: root, headingIndex: 0 }),
    );
    assertEquals(got, [[p1, 1]]);
  });
});
