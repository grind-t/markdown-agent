import { assert } from "@std/assert";
import type { Root } from "mdast";
import { getSectionContentLength } from "./get_section_content_length.ts";
import { getBlockContent } from "./get_block_content.ts";

export type FormatSubSectionForLLMInput = {
  markdown: string;
  ast: Root;
  headingIndex: number;
};

export function formatSubSectionForLLM(
  { markdown, ast, headingIndex }: FormatSubSectionForLLMInput,
): string {
  const heading = ast.children[headingIndex];

  assert(heading.type == "heading");

  const headingContent = getBlockContent(markdown, heading);
  const contentLength = getSectionContentLength({ ast, headingIndex });
  const comment = `<!-- id: ${headingIndex}, length: ${contentLength} -->`;

  return `${headingContent}\n\n${comment}`;
}
