// deno-lint-ignore-file no-explicit-any
import { describe, it } from "@std/testing/bdd";
import { assertEquals } from "@std/assert";
import { AstSlice } from "./ast_slice.ts";

describe("AstSlice", () => {
  it("addBlock inserts in order and avoids duplicates", () => {
    const root = { type: "root", children: [] } as any;
    const s = new AstSlice(root);

    s.addBlock(3);
    s.addBlock(1);
    s.addBlock(2);
    s.addBlock(2);

    assertEquals(s.indices, [1, 2, 3]);
  });

  it("removeBlock removes non-heading block only", () => {
    const p0 = { type: "paragraph" } as any;
    const p1 = { type: "paragraph" } as any;
    const p2 = { type: "paragraph" } as any;
    const root = { type: "root", children: [p0, p1, p2] } as any;

    const s = new AstSlice(root);
    s.addBlock(0);
    s.addBlock(1);
    s.addBlock(2);

    s.removeBlock(1);

    assertEquals(s.indices, [0, 2]);
  });

  it("removeBlock removes a heading and its section blocks", () => {
    const h0 = { type: "heading", depth: 2, children: [] } as any;
    const p1 = { type: "paragraph" } as any;
    const h_deeper = { type: "heading", depth: 3, children: [] } as any;
    const p2 = { type: "paragraph" } as any;
    const h1 = { type: "heading", depth: 2, children: [] } as any;
    const p3 = { type: "paragraph" } as any;

    const root = { type: "root", children: [h0, p1, h_deeper, p2, h1, p3] } as any;

    const s = new AstSlice(root);
    // add in order to simulate typical usage
    for (let i = 0; i < root.children.length; i++) s.addBlock(i);

    s.removeBlock(0);

    // should remove h0, p1, h_deeper, p2 (indices 0..3)
    assertEquals(s.indices, [4, 5]);
  });
});
