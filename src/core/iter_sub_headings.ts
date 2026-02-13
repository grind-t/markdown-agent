import { assert } from "@std/assert";
import type { Heading, Root } from "mdast";

export type IterSubHeadingsInput = {
  ast: Root;
  headingIndex: number;
  depth?: number;
};

export function* iterSubHeadings(
  { ast, headingIndex, depth = Infinity }: IterSubHeadingsInput,
): Generator<[Heading, number]> {
  const heading = ast.children[headingIndex];

  assert(heading.type === "heading");

  for (let i = headingIndex + 1; i < ast.children.length; i++) {
    const block = ast.children[i];

    if (block.type !== "heading") {
      continue;
    }

    const diff = block.depth - heading.depth;

    if (diff <= 0) {
      break;
    }

    if (diff > depth) {
      continue;
    }

    yield [block, i];
  }
}
