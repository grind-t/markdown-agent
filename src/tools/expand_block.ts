import { tool } from "@openai/agents";
import { z } from "zod";
import type { MarkdownAgentContext } from "../context.ts";

export const expandBlockTool = tool({
  name: "expand_block",
  description: "Expands content of a block",
  parameters: z.object({
    sectionId: z.number(),
    blockId: z.number(),
  }),
  execute: ({ sectionId, blockId }, ctx?: MarkdownAgentContext) => {
    const document = ctx!.context;
    const section = document.sections.find((v) => v.id === sectionId);

    if (!section) {
      return "Section not found";
    }

    const block = section.content.find((v) => v.id === blockId);

    if (!block) {
      return "Block not found";
    }

    return block.content;
  },
});
