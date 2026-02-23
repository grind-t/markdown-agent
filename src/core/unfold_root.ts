import type { Root } from "mdast";
import { DocumentSlice } from "./document_slice.ts";

export function unfoldRoot(ast: Root): DocumentSlice {
  const slice = new DocumentSlice(ast);

  for (let i = 0; i < ast.children.length; i++) {
    const block = ast.children[i];

    if (block.type === "heading" && block.depth === 1) {
      slice.addBlock(i);
    }
  }

  return slice;
}
