import type { Heading } from "mdast";

export const EMPTY_HEADING = {
  type: "heading",
  depth: 1,
  children: [],
  position: {
    start: { line: 1, column: 1, offset: 0 },
    end: { line: 1, column: 1, offset: 0 },
  },
} as const satisfies Heading;
