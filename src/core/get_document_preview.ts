import { getDocumentDepth } from "./get_document_depth.ts";
import { getBlockString } from "./get_block_string.ts";
import { getSectionBody } from "./get_section_body.ts";
import type { DocumentSlice } from "./document_slice.ts";

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

    if (block.type !== "heading") {
      const fullString = getBlockString(markdown, block);
      const isPreview = isLastLevel && fullString.length > 80;
      const string = isPreview ? fullString.slice(0, 80) + "..." : fullString;
      const comment = isPreview
        ? `<!-- id: ${index}, length: ${fullString.length} -->`
        : `<!-- id: ${index} -->`;

      result.push(`${string}\n${comment}`);
      continue;
    }

    const headingString = getBlockString(markdown, block);

    if (isLastLevel) {
      const { length } = getSectionBody({
        ast: slice.ast,
        headingIndex: index,
      });
      const comment = `<!-- id: ${index}, length: ${length} -->`;
      result.push(`${headingString}\n\n${comment}`);
    } else {
      level = block.depth + 1;
      result.push(headingString);
    }
  }

  return result.join("\n\n");
}
