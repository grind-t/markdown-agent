import type { Root, RootContent } from "mdast";

/**
 * Yield top-level blocks from `ast.children` starting at `start` until a heading.
 *
 * @param start - 0-based index into ast.children
 * @param ast - mdast Root
 * @yields RootContent - blocks (paragraph, code, html, etc.) until the next heading
 */
export function* iterBlocksFlat(start: number, ast: Root): Generator<RootContent> {
  for (let i = start; i < ast.children.length; i++) {
    const block = ast.children[i];
    if (block.type === "heading") break;
    yield block;
  }
}

