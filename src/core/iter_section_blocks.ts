import { assert } from "@std/assert";
import type { Root, RootContent } from "mdast";

export type IterSectionBlocksInput = {
  ast: Root;
  headingIndex: number;
};

export function* iterSectionBlocks(
  { ast, headingIndex }: IterSectionBlocksInput,
): Generator<RootContent> {
  const heading = ast.children[headingIndex];

  assert(heading.type === "heading");

  for (let i = headingIndex + 1; i < ast.children.length; i++) {
    const block = ast.children[i];

    if (block.type === "heading" && block.depth <= heading.depth) {
      break;
    }

    yield block;
  }
}
