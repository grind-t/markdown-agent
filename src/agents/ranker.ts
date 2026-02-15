import { Agent } from "@openai/agents";
import instructions from "./ranker-instructions.md" with { type: "text" };
import z from "zod";

export const markdownRanker = new Agent({
  name: "Markdown ranker",
  instructions,
  outputType: z.object({
    probabilites: z.array(
      z.object({
        id: z.number(),
        value: z.union([
          z.literal("high"),
          z.literal("medium"),
          z.literal("low"),
        ]),
      }),
    ).describe(
      "probabilities for each block or section to contain the information the user is looking for",
    ),
    completness: z.union([
      z.literal(1),
      z.literal(2),
      z.literal(3),
      z.literal(4),
      z.literal(5),
    ]),
  }),
});
