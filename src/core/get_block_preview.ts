import type { RootContent } from "mdast";
import { getBlockContent } from "./get_block_content.ts";

export type GetBlockPreviewInput = {
  markdown: string;
  block: RootContent;
  index: number;
};

const PREVIEW_LIMIT = 80;

export function getBlockPreview(
  { markdown, block, index }: GetBlockPreviewInput,
): string {
  const content = getBlockContent(markdown, block);

  if (content.length > PREVIEW_LIMIT) {
    const comment = `<!-- id: ${index}, length: ${content.length} -->`;
    const preview = content.slice(0, PREVIEW_LIMIT);
    return `${preview}...\n${comment}`;
  }

  return content;
}
