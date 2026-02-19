// deno-lint-ignore-file no-explicit-any
import { describe, it } from "@std/testing/bdd";
import { assertEquals } from "@std/assert";
import { DocumentUnfolder } from "./document_unfolder.ts";

function makeRoot(children: any[] = []) {
  return { type: "root", children } as any;
}

describe("DocumentUnfolder.unfoldNextLevel", () => {
  it("first call unfolds only root h1 headings", () => {
    const root = makeRoot([
      { type: "paragraph", children: [] },
      { type: "heading", depth: 1, children: [] },
      { type: "heading", depth: 2, children: [] },
      { type: "heading", depth: 1, children: [] },
      { type: "paragraph", children: [] },
    ]);
    const unfolder = new DocumentUnfolder(root);

    unfolder.unfoldNextLevel();

    assertEquals(unfolder.slice.indices, [1, 3]);
    assertEquals(unfolder.currentLevel, 1);
  });

  it("second call unfolds each h1 body until next heading", () => {
    const root = makeRoot([
      { type: "heading", depth: 1, children: [] }, // 0
      { type: "paragraph", children: [] }, // 1
      { type: "heading", depth: 2, children: [] }, // 2
      { type: "paragraph", children: [] }, // 3
      { type: "heading", depth: 1, children: [] }, // 4
      { type: "paragraph", children: [] }, // 5
      { type: "heading", depth: 2, children: [] }, // 6
      { type: "paragraph", children: [] }, // 7
    ]);
    const unfolder = new DocumentUnfolder(root);

    unfolder.unfoldNextLevel();
    unfolder.unfoldNextLevel();

    assertEquals(unfolder.slice.indices, [0, 1, 2, 4, 5, 6]);
  });

  it("second call includes only immediate child headings (h2), not deeper", () => {
    const root = makeRoot([
      { type: "heading", depth: 1, children: [] }, // 0
      { type: "heading", depth: 2, children: [] }, // 1
      { type: "heading", depth: 3, children: [] }, // 2
      { type: "heading", depth: 4, children: [] }, // 3
      { type: "heading", depth: 1, children: [] }, // 4
    ]);
    const unfolder = new DocumentUnfolder(root);

    unfolder.unfoldNextLevel();
    unfolder.unfoldNextLevel();

    assertEquals(unfolder.slice.indices, [0, 1, 4]);
  });

  it("unfolds recursively by level: level n only unfolds selected depth-n headings", () => {
    const root = makeRoot([
      { type: "heading", depth: 1, children: [] }, // 0
      { type: "heading", depth: 2, children: [] }, // 1
      { type: "heading", depth: 3, children: [] }, // 2
      { type: "paragraph", children: [] }, // 3
    ]);
    const unfolder = new DocumentUnfolder(root);

    unfolder.unfoldNextLevel();
    assertEquals(unfolder.slice.indices, [0]);

    unfolder.unfoldNextLevel();
    assertEquals(unfolder.slice.indices, [0, 1]);

    unfolder.unfoldNextLevel();
    assertEquals(unfolder.slice.indices, [0, 1, 2]);

    unfolder.unfoldNextLevel();
    assertEquals(unfolder.slice.indices, [0, 1, 2, 3]);
  });

  it("has no slice effect after deepest unfoldable level is reached", () => {
    const root = makeRoot([
      { type: "heading", depth: 1, children: [] }, // 0
      { type: "paragraph", children: [] }, // 1
      { type: "heading", depth: 2, children: [] }, // 2
      { type: "paragraph", children: [] }, // 3
    ]);
    const unfolder = new DocumentUnfolder(root);

    unfolder.unfoldNextLevel(); // h1
    unfolder.unfoldNextLevel(); // h1 body + h2
    unfolder.unfoldNextLevel(); // h2 body
    assertEquals(unfolder.slice.indices, [0, 1, 2, 3]);

    unfolder.unfoldNextLevel();
    unfolder.unfoldNextLevel();

    assertEquals(unfolder.slice.indices, [0, 1, 2, 3]);
    assertEquals(unfolder.currentLevel, 5);
  });
});
