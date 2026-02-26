import { getDocumentDepth } from "./get_document_depth.ts";
import type { DocumentSlice } from "./document_slice.ts";
import { getElementString } from "./get_element_string.ts";

export type GetDocumentPreviewInput = {
  markdown: string;
  slice: DocumentSlice;
};

export function getDocumentPreview(
  { markdown, slice }: GetDocumentPreviewInput,
): string {
  const result: string[] = [];
  const depth = getDocumentDepth(slice.blocks);
  let level = 1;

  for (const index of slice.indices) {
    const block = slice.ast.children[index];
    const isLastLevel = level === depth;

    result.push(getElementString({
      markdown,
      ast: slice.ast,
      index,
      isLastLevel,
    }));

    if (!isLastLevel && block.type === "heading") {
      level = block.depth + 1;
    }
  }

  return result.join("\n\n");
}
