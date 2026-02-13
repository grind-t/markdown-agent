import { assert } from "@std/assert";
import type { Root, RootContent } from "mdast";

export type IterSectionBlocksFlatInput = {
  ast: Root;
  headingIndex: number;
};

export function* iterSectionBlocksFlat(
  { ast, headingIndex }: IterSectionBlocksFlatInput,
): Generator<[RootContent, number]> {
  const heading = ast.children[headingIndex];

  assert(heading.type === "heading");

  for (let i = headingIndex + 1; i < ast.children.length; i++) {
    const block = ast.children[i];

    if (block.type === "heading") {
      break;
    }

    yield [block, i];
  }
}
