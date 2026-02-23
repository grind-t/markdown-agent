// deno-lint-ignore-file no-explicit-any
import { describe, it } from "@std/testing/bdd";
import { assertEquals } from "@std/assert";
import { unfoldSection } from "./unfold_section.ts";

function makeRoot(children: any[] = []) {
  return { type: "root", children } as any;
}

describe("unfoldSection", () => {
  it("returns heading + body + immediate child headings within section", () => {
    const root = makeRoot([
      { type: "heading", depth: 1, children: [] }, // 0
      { type: "paragraph", children: [] }, // 1
      { type: "heading", depth: 2, children: [] }, // 2
      { type: "heading", depth: 3, children: [] }, // 3
      { type: "paragraph", children: [] }, // 4
      { type: "heading", depth: 2, children: [] }, // 5
      { type: "heading", depth: 1, children: [] }, // 6
    ]);

    const slice = unfoldSection({ ast: root, headingIndex: 0 });

    assertEquals(slice.indices, [0, 1, 2, 5]);
  });
});
