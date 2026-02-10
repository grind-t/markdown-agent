import type { RootContent } from "mdast";

export function getBlockContent(markdown: string, block: RootContent): string {
  const start = block.position!.start.offset!;
  const end = block.position!.end.offset!;

  return markdown.slice(start, end);
}
