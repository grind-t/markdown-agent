import type { RootContent } from "mdast";
import { maxOf } from "@std/collections";

export function getDocumentDepth(blocks: RootContent[]): number {
  const headings = blocks.filter((v) => v.type === "heading");
  return maxOf(headings, (heading) => heading.depth) ?? 0;
}
