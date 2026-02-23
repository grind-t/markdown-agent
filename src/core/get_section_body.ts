import type { Root } from "mdast";
import { DocumentSlice } from "./document_slice.ts";
import { assert } from "@std/assert";

export type GetSectionBodyInput = {
  ast: Root;
  headingIndex: number;
};

export function getSectionBody(
  { ast, headingIndex }: GetSectionBodyInput,
): DocumentSlice {
  const slice = new DocumentSlice(ast);
  const heading = ast.children[headingIndex];

  assert(heading.type === "heading");

  for (let i = headingIndex + 1; i < ast.children.length; i++) {
    const block = ast.children[i];

    if (block.type === "heading" && block.depth <= heading.depth) {
      break;
    }

    slice.addBlock(i);
  }

  return slice;
}
