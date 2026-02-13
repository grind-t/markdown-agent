import type { RootContent } from "mdast";
import { getBlockContent } from "./get_block_content.ts";

export type FormatBlockForLlmOutput = {
  id: number;
  type: RootContent["type"];
  content?: string;
  preview?: string;
  length?: number;
};

export type FormatBlockForLlmInput = {
  id: number;
  block: RootContent;
  markdown: string;
};

const PREVIEW_LIMIT = 80;

export function formatBlockForLlm(
  { id, block, markdown }: FormatBlockForLlmInput,
): FormatBlockForLlmOutput {
  const content = getBlockContent(markdown, block);

  if (content.length > PREVIEW_LIMIT) {
    return {
      id,
      type: block.type,
      preview: content.slice(0, PREVIEW_LIMIT),
      length: content.length,
    };
  }

  return {
    id,
    type: block.type,
    content,
  };
}
