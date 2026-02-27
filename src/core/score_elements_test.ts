import { describe, it } from "@std/testing/bdd";
import { assertEquals } from "@std/assert";
import { fromMarkdown } from "mdast-util-from-markdown";
import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import type z from "zod";
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
    const document =
      "Completely unrelated maintenance note about rotating archive files.\n<!-- id: 0 -->";
    const ids = ["0"];
    const query = "Where is the unique token ZXQJ-4391 documented?";

    const result = await scoreElements({ ids, document, query, scorer });

    assertEquals(result, { "0": "low" });
  });

  it("scores mixed blocks as high, medium, and low based on relevance", async () => {
    const document =
      "The support email for Project Phoenix is help@phoenix.example.\n<!-- id: 0 -->\n\nProject Phoenix has a support team and contact details in the help center.\n<!-- id: 1 -->\n\nBananas are yellow and rich in potassium.\n<!-- id: 2 -->";
    const ids = ["0", "1", "2"];
    const query = "What is the support email for Project Phoenix?";

    const result = await scoreElements({ ids, document, query, scorer });

    assertEquals(result, {
      "0": "high",
      "1": "medium",
      "2": "low",
    });
  });
});
