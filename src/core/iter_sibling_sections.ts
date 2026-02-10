import type { Heading, Root, RootContent } from "mdast";

export type Section = {
  id: number;
  heading: Heading;
  content: RootContent[];
};

export type IterSiblingSectionsOptions = {
  ast: Root;
  startIndex: number;
  level: number;
};

/**
 * Yield consecutive sections starting at startIndex where headings have depth === level.
 * If the node at startIndex is not a heading at the given level, yields nothing.
 */
export function* iterSiblingSections(
  { ast, startIndex, level }: IterSiblingSectionsOptions,
): Generator<Section> {
  let id = startIndex;
  let heading = ast.children[id];
  let content: RootContent[] = [];

  if (heading?.type !== "heading" || heading.depth !== level) {
    return;
  }

  for (let i = startIndex + 1; i < ast.children.length; i++) {
    const block = ast.children[i];

    if (block.type !== "heading" || block.depth > level) {
      content.push(block);
      continue;
    }

    if (block.depth < level) {
      break;
    }

    yield { id, heading, content };

    id = i;
    heading = block;
    content = [];
  }

  yield { id, heading, content };
}
