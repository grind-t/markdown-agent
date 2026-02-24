import { describe, it } from "@std/testing/bdd";
import { assertEquals } from "@std/assert";
import { fromMarkdown } from "mdast-util-from-markdown";
import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import type z from "zod";
import { DocumentSlice } from "./document_slice.ts";
import { type ScoredElements, scoreElements } from "./score_elements.ts";

const MODEL = "gpt-5-mini";

const client = new OpenAI({ apiKey: Deno.env.get("OPENAI_API_KEY") });

const scorer = async (
  prompt: string,
  outputSchema: z.ZodType<ScoredElements>,
): Promise<ScoredElements> => {
  const response = await client.responses.parse({
    model: MODEL,
    input: prompt,
    text: {
      format: zodTextFormat(outputSchema, "score_response"),
    },
  });

  return response.output_parsed ?? {};
};

describe("scoreElements", () => {
  it("returns low for a selected block irrelevant to the query", async () => {
    const markdown =
      "Completely unrelated maintenance note about rotating archive files.";
    const ast = fromMarkdown(markdown);
    const slice = new DocumentSlice(ast, [0]);
    const query = "Where is the unique token ZXQJ-4391 documented?";

    const result = await scoreElements({ markdown, slice, query, scorer });

    assertEquals(result, { "0": "low" });
  });

  it("scores mixed blocks as high, medium, and low based on relevance", async () => {
    const markdown = [
      "The support email for Project Phoenix is help@phoenix.example.",
      "Project Phoenix has a support team and contact details in the help center.",
      "Bananas are yellow and rich in potassium.",
    ].join("\n\n");
    const ast = fromMarkdown(markdown);
    const slice = new DocumentSlice(ast, [0, 1, 2]);
    const query = "What is the support email for Project Phoenix?";

    const result = await scoreElements({ markdown, slice, query, scorer });

    assertEquals(result, {
      "0": "high",
      "1": "medium",
      "2": "low",
    });
  });
});
