import type { RootContent } from "mdast";

export function getBlockLength(block: RootContent): number {
  const start = block.position!.start.offset!;
  const end = block.position!.end.offset!;

  return end - start;
}
