import { getBlockLength } from "./get_block_length.ts";
import type { Section } from "./iter_sibling_sections.ts";

export function getSectionContentLength(section: Section): number {
  return section.content.reduce((acc, v) => acc + getBlockLength(v), 0);
}
