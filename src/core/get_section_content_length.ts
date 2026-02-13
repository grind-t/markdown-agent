import type { Root } from "mdast";
import { iterSectionBlocks } from "./iter_section_blocks.ts";

export type GetSectionContentLengthInput = {
  ast: Root;
  headingIndex: number;
};

export function getSectionContentLength(
  input: GetSectionContentLengthInput,
): number {
  const blocks = Array.from(iterSectionBlocks(input));
  const start = blocks.at(0)?.position?.start.offset ?? 0;
  const end = blocks.at(-1)?.position?.end.offset ?? 0;

  return end - start;
}
