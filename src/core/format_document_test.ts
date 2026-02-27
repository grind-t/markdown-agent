// deno-lint-ignore-file no-explicit-any
import { describe, it } from "@std/testing/bdd";
import { assertEquals } from "@std/assert";
import { DocumentSlice } from "./document_slice.ts";
import { formatDocument } from "./format_document.ts";

function makeRoot(children: any[] = []) {
  return { type: "root", children } as any;
}

describe("formatDocument", () => {
  it("formats a single non-heading block at default level 1", () => {
    const root = makeRoot([{ type: "paragraph", children: [] }]);
    const slice = new DocumentSlice(root, [0]);
    const calls: any[] = [];

    const result = formatDocument(slice, (input) => {
      calls.push(input);
      return `i:${input.index}|l:${input.level}`;
    });

    assertEquals(calls.length, 1);
    assertEquals(calls[0].level, 1);
    assertEquals(result, "i:0|l:1");
  });

  it("uses heading depth as formatter level for heading blocks", () => {
    const root = makeRoot([{ type: "heading", depth: 3, children: [] }]);
    const slice = new DocumentSlice(root, [0]);
    const calls: any[] = [];

    formatDocument(slice, (input) => {
      calls.push(input);
      return "ok";
    });

    assertEquals(calls.length, 1);
    assertEquals(calls[0].level, 3);
  });

  it("updates running level after heading and applies it to following non-heading", () => {
    const root = makeRoot([
      { type: "heading", depth: 2, children: [] },
      { type: "paragraph", children: [] },
    ]);
    const slice = new DocumentSlice(root, [0, 1]);
    const levels: number[] = [];

    formatDocument(slice, (input) => {
      levels.push(input.level);
      return "ok";
    });

    assertEquals(levels, [2, 3]);
  });

  it("resets running level when a new heading appears", () => {
    const root = makeRoot([
      { type: "heading", depth: 2, children: [] },
      { type: "paragraph", children: [] },
      { type: "heading", depth: 1, children: [] },
      { type: "paragraph", children: [] },
    ]);
    const slice = new DocumentSlice(root, [0, 1, 2, 3]);
    const levels: number[] = [];

    formatDocument(slice, (input) => {
      levels.push(input.level);
      return "ok";
    });

    assertEquals(levels, [2, 3, 1, 2]);
  });

  it("keeps running level unchanged across consecutive non-heading blocks", () => {
    const root = makeRoot([
      { type: "heading", depth: 1, children: [] },
      { type: "paragraph", children: [] },
      { type: "paragraph", children: [] },
    ]);
    const slice = new DocumentSlice(root, [0, 1, 2]);
    const levels: number[] = [];

    formatDocument(slice, (input) => {
      levels.push(input.level);
      return "ok";
    });

    assertEquals(levels, [1, 2, 2]);
  });
});
