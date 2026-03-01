import { describe, it } from "@std/testing/bdd";
import { assertEquals } from "@std/assert";
import { queryMarkdown } from "./main.ts";
import type { Score, ScoredElements, Scorer } from "./core/score_elements.ts";

type ScorerRound = Record<string, Score>;

function makeQueuedScorer(rounds: ScorerRound[]) {
  let callCount = 0;

  const scorer: Scorer = async (_prompt, outputSchema) => {
    const round = rounds[callCount] ?? {};
    callCount++;

    return outputSchema.parse(round) as ScoredElements;
  };

  return { scorer, getCallCount: () => callCount };
}

describe("queryMarkdown", () => {
  it("keeps only the relevant top-level section and returns full section content", async () => {
    const markdown = `# A

A body.

# B

B body.`;
    const { scorer, getCallCount } = makeQueuedScorer([
      { "0": "high", "2": "low" },
      { "1": "high" },
      { "1": "high" },
    ]);

    const result = await queryMarkdown(markdown, "A body", scorer);

    assertEquals(
      result,
      `# A

A body.`,
    );
    assertEquals(getCallCount(), 3);
  });

  it("keeps nested relevant path while pruning unrelated sibling branches", async () => {
    const markdown = `# A

A body.

## A1

A1 body.

# B

B body.`;
    const { scorer, getCallCount } = makeQueuedScorer([
      { "0": "high", "4": "low" },
      { "1": "low", "2": "high" },
      { "3": "high" },
      { "3": "high" },
    ]);

    const result = await queryMarkdown(markdown, "A1 body", scorer);

    assertEquals(
      result,
      `# A

## A1

A1 body.`,
    );
    assertEquals(getCallCount(), 4);
  });

  it("returns top-level headings when all first-pass candidates are scored low", async () => {
    const markdown = `# A

A body.

# B

B body.`;
    const { scorer, getCallCount } = makeQueuedScorer([
      { "0": "low", "2": "low" },
    ]);

    const result = await queryMarkdown(markdown, "nothing relevant", scorer);

    assertEquals(result, "Nothing relevant");
    assertEquals(getCallCount(), 1);
  });
});
