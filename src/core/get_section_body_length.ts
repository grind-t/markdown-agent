import type { Root } from "mdast";
import { iterSectionBlocks } from "./iter_section_blocks.ts";

export type GetSectionBodyLengthInput = {
  ast: Root;
  headingIndex: number;
};

export function getSectionBodyLength(
  input: GetSectionBodyLengthInput,
): number {
  const blocks = Array.from(iterSectionBlocks(input));
  const start = blocks.at(0)?.[0]?.position?.start.offset ?? 0;
  const end = blocks.at(-1)?.[0]?.position?.end.offset ?? 0;

  return end - start;
}
