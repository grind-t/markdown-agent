import type { RootContent } from "mdast";

export function getDocumentDepth(blocks: RootContent[]): number {
  return blocks.reduce((acc, block, i) => {
    if (block.type !== "heading") return acc;

    const nextBlock = blocks[i + 1];
    const hasBody = nextBlock &&
      (nextBlock.type !== "heading" || nextBlock.depth > block.depth);
    const depth = hasBody ? block.depth + 1 : block.depth;

    return Math.max(depth, acc);
  }, 0);
}
