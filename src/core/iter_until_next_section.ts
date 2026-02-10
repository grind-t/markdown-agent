import type { Root, RootContent } from "mdast";

/**
 * Yield top-level blocks from `ast.children` starting at index until a heading.
 *
 * @param startIndex - 0-based index into ast.children
 * @param ast - mdast Root
 * @yields RootContent - blocks (paragraph, code, html, etc.) until the next heading
 */
export function* iterUntilNextSection(
  startIndex: number,
  ast: Root,
): Generator<RootContent> {
  for (let i = startIndex; i < ast.children.length; i++) {
    const block = ast.children[i];
    if (block.type === "heading") break;
    yield block;
  }
}
