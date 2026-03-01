import type { Scorer } from "./src/core/score_elements.ts";
import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { queryMarkdown } from "./src/main.ts";

const MODEL = "gpt-5-mini";

const client = new OpenAI({ apiKey: Deno.env.get("OPENAI_API_KEY") });
const scorer: Scorer = async (prompt, outputSchema) => {
  const response = await client.responses.parse({
    model: MODEL,
    reasoning: { effort: "minimal" },
    input: prompt,
    text: {
      format: zodTextFormat(outputSchema, "score_response"),
    },
  });

  return response.output_parsed ?? {};
};

const md = await Deno.readTextFile("./playground-in.md");
const result = await queryMarkdown(
  md,
  "You are given the Deno documentation; find all the relevant information about how to deploy a Deno application.",
  scorer,
);

await Deno.writeTextFile("./playgorund-out.md", result);
