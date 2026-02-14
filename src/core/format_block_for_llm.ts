import type { RootContent } from "mdast";
import { getBlockContent } from "./get_block_content.ts";

export type FormatBlockForLLMInput = {
  markdown: string;
  block: RootContent;
  index: number;
};

const PREVIEW_LIMIT = 80;

export function formatBlockForLLM(
  { markdown, block, index }: FormatBlockForLLMInput,
): string {
  const content = getBlockContent(markdown, block);

  if (content.length > PREVIEW_LIMIT) {
    const comment = `<!-- id: ${index}, length: ${content.length} -->`;
    const preview = content.slice(0, PREVIEW_LIMIT);
    return `${preview}...\n${comment}`;
  }

  return content;
}
