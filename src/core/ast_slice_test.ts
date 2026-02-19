// deno-lint-ignore-file no-explicit-any
import { describe, it } from "@std/testing/bdd";
import { assertEquals } from "@std/assert";
import { AstSlice } from "./ast_slice.ts";

function makeRoot(children: any[] = []) {
  return { type: "root", children } as any;
}

describe("AstSlice.addBlock", () => {
  it("appends when index is greater than all existing", () => {
    const slice = new AstSlice(makeRoot());
    slice.addBlock(1);
    slice.addBlock(3);
    slice.addBlock(5);

    assertEquals(slice.indices, [1, 3, 5]);
  });

  it("prepends when index is smaller than all existing", () => {
    const slice = new AstSlice(makeRoot());
    slice.addBlock(2);
    slice.addBlock(4);
    slice.addBlock(1);

    assertEquals(slice.indices, [1, 2, 4]);
  });

  it("inserts into middle while keeping ascending sort", () => {
    const slice = new AstSlice(makeRoot());
    slice.addBlock(2);
    slice.addBlock(6);
    slice.addBlock(4);

    assertEquals(slice.indices, [2, 4, 6]);
  });

  it("does not insert duplicate at start", () => {
    const slice = new AstSlice(makeRoot());
    slice.addBlock(1);
    slice.addBlock(3);
    slice.addBlock(1);

    assertEquals(slice.indices, [1, 3]);
  });

  it("does not insert duplicate in middle", () => {
    const slice = new AstSlice(makeRoot());
    slice.addBlock(1);
    slice.addBlock(3);
    slice.addBlock(5);
    slice.addBlock(3);

    assertEquals(slice.indices, [1, 3, 5]);
  });

  it("does not insert duplicate at end", () => {
    const slice = new AstSlice(makeRoot());
    slice.addBlock(1);
    slice.addBlock(3);
    slice.addBlock(3);

    assertEquals(slice.indices, [1, 3]);
  });
});

describe("AstSlice.removeBlock", () => {
  it("removes existing index at start", () => {
    const slice = new AstSlice(makeRoot());
    slice.addBlock(1);
    slice.addBlock(3);
    slice.addBlock(5);

    slice.removeBlock(1);

    assertEquals(slice.indices, [3, 5]);
  });

  it("removes existing index in middle", () => {
    const slice = new AstSlice(makeRoot());
    slice.addBlock(1);
    slice.addBlock(3);
    slice.addBlock(5);

    slice.removeBlock(3);

    assertEquals(slice.indices, [1, 5]);
  });

  it("removes existing index at end", () => {
    const slice = new AstSlice(makeRoot());
    slice.addBlock(1);
    slice.addBlock(3);
    slice.addBlock(5);

    slice.removeBlock(5);

    assertEquals(slice.indices, [1, 3]);
  });

  it("is a no-op when index does not exist", () => {
    const slice = new AstSlice(makeRoot());
    slice.addBlock(1);
    slice.addBlock(3);

    slice.removeBlock(2);

    assertEquals(slice.indices, [1, 3]);
  });
});

describe("AstSlice.pruneEmptySections", () => {
  it("is a no-op when indices is empty", () => {
    const root = makeRoot([{ type: "heading", depth: 2, children: [] }]);
    const slice = new AstSlice(root);

    slice.pruneEmptySections();

    assertEquals(slice.indices, []);
  });

  it("prunes a heading when it has no later selected block", () => {
    const h2 = { type: "heading", depth: 2, children: [] } as any;
    const root = makeRoot([h2]);
    const slice = new AstSlice(root);
    slice.addBlock(0);

    slice.pruneEmptySections();

    assertEquals(slice.indices, []);
  });

  it("prunes a heading when next selected block is heading of same depth", () => {
    const h2a = { type: "heading", depth: 2, children: [] } as any;
    const h2b = { type: "heading", depth: 2, children: [] } as any;
    const p = { type: "paragraph", children: [] } as any;
    const root = makeRoot([h2a, h2b, p]);
    const slice = new AstSlice(root);
    slice.addBlock(0);
    slice.addBlock(1);
    slice.addBlock(2);

    slice.pruneEmptySections();

    assertEquals(slice.indices, [1, 2]);
  });

  it("prunes a heading when next selected block is heading of shallower depth", () => {
    const h3 = { type: "heading", depth: 3, children: [] } as any;
    const h2 = { type: "heading", depth: 2, children: [] } as any;
    const p = { type: "paragraph", children: [] } as any;
    const root = makeRoot([h3, h2, p]);
    const slice = new AstSlice(root);
    slice.addBlock(0);
    slice.addBlock(1);
    slice.addBlock(2);

    slice.pruneEmptySections();

    assertEquals(slice.indices, [1, 2]);
  });

  it("keeps a heading when next selected block is deeper heading", () => {
    const h2 = { type: "heading", depth: 2, children: [] } as any;
    const h3 = { type: "heading", depth: 3, children: [] } as any;
    const p = { type: "paragraph", children: [] } as any;
    const root = makeRoot([h2, h3, p]);
    const slice = new AstSlice(root);
    slice.addBlock(0);
    slice.addBlock(1);
    slice.addBlock(2);

    slice.pruneEmptySections();

    assertEquals(slice.indices, [0, 1, 2]);
  });

  it("keeps a heading when next selected block is non-heading content", () => {
    const h2 = { type: "heading", depth: 2, children: [] } as any;
    const p = { type: "paragraph", children: [] } as any;
    const root = makeRoot([h2, p]);
    const slice = new AstSlice(root);
    slice.addBlock(0);
    slice.addBlock(1);

    slice.pruneEmptySections();

    assertEquals(slice.indices, [0, 1]);
  });

  it("cascades pruning for selected headings with no selected content", () => {
    const h1 = { type: "heading", depth: 1, children: [] } as any;
    const h2 = { type: "heading", depth: 2, children: [] } as any;
    const root = makeRoot([h1, h2]);
    const slice = new AstSlice(root);
    slice.addBlock(0);
    slice.addBlock(1);

    slice.pruneEmptySections();

    assertEquals(slice.indices, []);
  });

  it("keeps nested headings when selected content exists under them", () => {
    const h1 = { type: "heading", depth: 1, children: [] } as any;
    const h2 = { type: "heading", depth: 2, children: [] } as any;
    const p = { type: "paragraph", children: [] } as any;
    const root = makeRoot([h1, h2, p]);
    const slice = new AstSlice(root);
    slice.addBlock(0);
    slice.addBlock(1);
    slice.addBlock(2);

    slice.pruneEmptySections();

    assertEquals(slice.indices, [0, 1, 2]);
  });
});
