import type { Root } from "mdast";
import { DocumentSlice } from "./document_slice.ts";
import { assert } from "@std/assert";

export type UnfoldSectionInput = {
  ast: Root;
  headingIndex: number;
};

export function unfoldSection(
  { ast, headingIndex }: UnfoldSectionInput,
): DocumentSlice {
  const slice = new DocumentSlice(ast);
  const heading = ast.children[headingIndex];

  assert(heading.type === "heading");
  slice.addBlock(headingIndex);

  let i = headingIndex + 1;

  for (; i < ast.children.length; i++) {
    const block = ast.children[i];

    if (block.type === "heading") break;

    slice.addBlock(i);
  }

  for (; i < ast.children.length; i++) {
    const block = ast.children[i];

    if (block.type === "heading" && block.depth <= heading.depth) {
      break;
    }

    if (block.type === "heading" && block.depth === heading.depth + 1) {
      slice.addBlock(i);
    }
  }

  return slice;
}
