import type { Root, RootContent } from "mdast";

export function* iterBlocksFlat(
  start: number,
  ast: Root,
): Generator<RootContent> {
  for (let i = start; i < ast.children.length; i++) {
    const block = ast.children[i];

    if (block.type === "heading") {
      break;
    }

    yield block;
  }
}
