import z from "zod";
import type { DocumentSlice } from "./document_slice.ts";
import { getDocumentDepth } from "./get_document_depth.ts";
import { getDocumentPreview } from "./get_document_preview.ts";

const ScoreSchema = z.union([
  z.literal("low"),
  z.literal("medium"),
  z.literal("high"),
]);

export type Score = z.infer<typeof ScoreSchema>;
export type ScoredElements = Record<string, Score>;
export type Scorer = (
  prompt: string,
  outputSchema: z.ZodType<ScoredElements>,
) => Promise<ScoredElements>;

export type ScoreElementsInput = {
  markdown: string;
  slice: DocumentSlice;
  query: string;
  scorer: Scorer;
};

export function scoreElements(
  { markdown, slice, query, scorer }: ScoreElementsInput,
): Promise<ScoredElements> {
  const depth = getDocumentDepth(slice.blocks);
  const preview = getDocumentPreview({ markdown, slice });
  const outputShape = {} as Record<string, typeof ScoreSchema>;

  for (const index of slice.indices) {
    const block = slice.ast.children[index];

    if (block.type !== "heading" || block.depth === depth) {
      outputShape[String(index)] = ScoreSchema;
    }
  }

  const prompt = `
    <context>
      You are given a markdown document that consists of the following element types:

      a. A regular markdown block element - followed by a comment <!-- id: <element id> -->
      b. A markdown block preview - a truncated block element followed by a comment <!-- id: <element id>, length: <full element length> -->
      c. A markdown section preview - a section heading followed by a comment <!-- id: <section id>, length: <section body length> -->
    </context>

    <goal>
      Your task is to score each element by how likely it is to contain information needed to answer the user's query:

      - For preview elements (\`b\` and \`c\`) estimate the probability that the unseen part contains relevant information.
      - For regular elements (\`a\`) estimate how relevant information is.
    </goal>

    <user-query>
      ${query}
    </user-query>

    <document>
      ${preview}
    </document>
  `;

  const outputSchema = z.object(outputShape);

  return scorer(prompt, outputSchema);
}
