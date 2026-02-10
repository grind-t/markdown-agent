import { describe, it } from "@std/testing/bdd";
import { assertEquals } from "@std/assert";
import { iterUntilNextSection } from "./iter_until_next_section.ts";

describe("iter_until_next_section", () => {
  it("yields nothing for an empty AST", () => {
    const root = { type: "root", children: [] } as any;
    const got = Array.from(iterUntilNextSection(0, root));
    assertEquals(got, []);
  });

  it("yields nothing when start is at or past the end", () => {
    const p = { type: "paragraph", value: "p1" } as any;
    const root = { type: "root", children: [p] } as any;

    assertEquals(Array.from(iterUntilNextSection(1, root)), []);
    assertEquals(Array.from(iterUntilNextSection(2, root)), []);
  });

  it("stops immediately if a heading is at start", () => {
    const h = { type: "heading", depth: 1, children: [] } as any;
    const p = { type: "paragraph", value: "p1" } as any;
    const root = { type: "root", children: [h, p] } as any;

    assertEquals(Array.from(iterUntilNextSection(0, root)), []);
  });

  it("yields blocks until the next heading and then stops", () => {
    const p1 = { type: "paragraph", value: "p1" } as any;
    const p2 = { type: "paragraph", value: "p2" } as any;
    const h = { type: "heading", depth: 2, children: [] } as any;
    const code = { type: "code", lang: "ts", value: "x" } as any;

    const root = { type: "root", children: [p1, p2, h, code] } as any;

    const got = Array.from(iterUntilNextSection(0, root));
    assertEquals(got, [p1, p2]);
  });
});
