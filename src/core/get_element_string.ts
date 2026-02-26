import type { Root } from "mdast";
import { getBlockString } from "./get_block_string.ts";
import { getSectionBody } from "./get_section_body.ts";

export type GetElementStringInput = {
  markdown: string;
  ast: Root;
  index: number;
  isLastLevel: boolean;
};

export function getElementString(
  { markdown, ast, index, isLastLevel }: GetElementStringInput,
): string {
  const block = ast.children[index];
  const blockString = getBlockString(markdown, block);

  if (block.type === "heading") {
    if (!isLastLevel) return blockString;

    const { length } = getSectionBody({ ast, headingIndex: index });
    const comment = `<!-- id: ${index}, length: ${length} -->`;
    return `${blockString}\n\n${comment}`;
  }

  const isPreview = isLastLevel && blockString.length > 80;
  const string = isPreview ? blockString.slice(0, 80) + "..." : blockString;
  const comment = isPreview
    ? `<!-- id: ${index}, length: ${blockString.length} -->`
    : `<!-- id: ${index} -->`;

  return `${string}\n${comment}`;
}
