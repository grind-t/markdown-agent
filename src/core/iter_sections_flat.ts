import type { Heading, Root, RootContent } from "mdast";

export type Section = {
  id: number;
  heading: Heading;
  content: RootContent[];
};

export function* iterSectionsFlat(
  start: number,
  ast: Root,
): Generator<Section> {
  let section: Section | undefined;

  for (let i = start; i < ast.children.length; i++) {
    const block = ast.children[i];

    if (block.type === "heading") {
      section = { id: i, heading: block, content: [] };
      break;
    }
  }

  if (!section) return;

  for (let i = section.id + 1; i < ast.children.length; i++) {
    const block = ast.children[i];

    if (block.type !== "heading" || block.depth > section.heading.depth) {
      section.content.push(block);
      continue;
    }

    if (block.depth < section.heading.depth) {
      break;
    }

    yield section;
    section = { id: i, heading: block, content: [] };
  }

  yield section;
}
