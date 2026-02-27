import z from "zod";

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
  ids: string[];
  document: string;
  query: string;
  scorer: Scorer;
};

export function scoreElements(
  { ids, document, query, scorer }: ScoreElementsInput,
): Promise<ScoredElements> {
  const outputShape = ids.reduce(
    (acc, id) => ({ ...acc, [id]: ScoreSchema }),
    {} as Record<string, typeof ScoreSchema>,
  );
  const outputSchema = z.object(outputShape);

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
      ${document}
    </document>
  `;

  return scorer(prompt, outputSchema);
}
