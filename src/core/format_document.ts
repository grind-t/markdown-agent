import type { Root, RootContent } from "mdast";
import type { DocumentSlice } from "./document_slice.ts";

export type DocumentBlockFormatterInput = {
  block: RootContent;
  index: number;
  level: number;
  ast: Root;
};

export type DocumentBlockFormatter = (
  input: DocumentBlockFormatterInput,
) => string;

export function formatDocument(
  document: DocumentSlice,
  formatter: DocumentBlockFormatter,
): string {
  const { ast, indices } = document;
  const result: string[] = [];
  let level = 1;

  for (const index of indices) {
    const block = ast.children[index];
    const isHeading = block.type === "heading";

    if (isHeading) {
      result.push(formatter({ block, ast, index, level: block.depth }));
      level = block.depth + 1;
    } else {
      result.push(formatter({ block, ast, index, level }));
    }
  }

  return result.join("\n\n");
}
