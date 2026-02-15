import { describe, it } from "@std/testing/bdd";
import { assert, assertEquals } from "@std/assert";
import { run } from "@openai/agents";
import { markdownRanker } from "./ranker.ts";

type RankerOutput = {
  probabilites: Array<{ id: number; value: "high" | "medium" | "low" }>;
  completness: 1 | 2 | 3 | 4 | 5;
};

async function runRanker(markdown: string, query: string) {
  const input = `User query: ${query}\n\nMarkdown:\n${markdown}`;
  const result = await run(markdownRanker, input);
  assert(result.finalOutput);
  return result.finalOutput as RankerOutput;
}

function getProbability(output: RankerOutput, id: number) {
  return output.probabilites.find((item) => item.id === id)?.value;
}

describe("markdownRanker", () => {
  it("ranks a clear full-section answer as high", async () => {
    const markdown =
      `# Overview\nGeneral notes.\n<!-- id: 1 -->\n\n# Refund Policy\nRefunds are allowed within 30 days.\n<!-- id: 2 -->`;
    const output = await runRanker(markdown, "What is the refund window?");

    assertEquals(getProbability(output, 2), "high");
    assertEquals(output.completness, 5);
  });

  it("marks low confidence when answer is not present", async () => {
    const markdown =
      `# Overview\nGeneral notes.\n<!-- id: 3 -->\n\n# Shipping\nStandard shipping is 5 days.\n<!-- id: 4 -->`;
    const output = await runRanker(markdown, "What is the refund window?");

    assertEquals(getProbability(output, 3), "low");
    assertEquals(getProbability(output, 4), "low");
    assertEquals(output.completness, 1);
  });

  it("treats an abbreviated matching section as likely relevant", async () => {
    const markdown =
      `# Refund Policy\n\n<!-- id: 10, length: 420 -->\n\n# Shipping\nStandard shipping is 5 days.\n<!-- id: 11 -->`;
    const output = await runRanker(markdown, "What is the refund window?");

    assertEquals(getProbability(output, 10), "high");
  });

  it("treats an abbreviated but misleading section as low relevance", async () => {
    const markdown =
      `# Refund Policy\n\n<!-- id: 12, length: 40 -->\n\n# API Rate Limits\nRequests are limited to 60/min.\n<!-- id: 13 -->`;
    const output = await runRanker(markdown, "What are the API rate limits?");

    assertEquals(getProbability(output, 12), "low");
    assertEquals(getProbability(output, 13), "high");
  });

  it("prioritizes a relevant abbreviated block within a section", async () => {
    const markdown =
      `# API Limits\nSee details below.\nRequests are limited to 120/min.\n<!-- id: 20, length: 200 -->\n\n# Pricing\nPrices are listed on the site.\n<!-- id: 21 -->`;
    const output = await runRanker(markdown, "What are the API rate limits?");

    assertEquals(getProbability(output, 20), "high");
  });

  it("ranks the single relevant block highest among multiple abbreviated blocks", async () => {
    const markdown =
      `# Policies\nRefunds are allowed within 14 days.\n<!-- id: 31, length: 180 -->\n\n# Shipping\nStandard shipping is 5 days.\n<!-- id: 32, length: 120 -->\n\n# Support\nEmail support is available.\n<!-- id: 33, length: 90 -->`;
    const output = await runRanker(markdown, "What is the refund window?");

    assertEquals(getProbability(output, 31), "high");
    assertEquals(getProbability(output, 32), "low");
    assertEquals(getProbability(output, 33), "low");
  });
});
