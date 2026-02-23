// deno-lint-ignore-file no-explicit-any
import { describe, it } from "@std/testing/bdd";
import { assertEquals } from "@std/assert";
import { unfoldRoot } from "./unfold_root.ts";

function makeRoot(children: any[] = []) {
  return { type: "root", children } as any;
}

describe("unfoldRoot", () => {
  it("selects all and only depth-1 headings", () => {
    const root = makeRoot([
      { type: "heading", depth: 1, children: [] }, // 0
      { type: "paragraph", children: [] }, // 1
      { type: "heading", depth: 2, children: [] }, // 2
      { type: "heading", depth: 1, children: [] }, // 3
      { type: "blockquote", children: [] }, // 4
      { type: "heading", depth: 3, children: [] }, // 5
      { type: "heading", depth: 1, children: [] }, // 6
    ]);

    const slice = unfoldRoot(root);

    assertEquals(slice.indices, [0, 3, 6]);
  });
});
