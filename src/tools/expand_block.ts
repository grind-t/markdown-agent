import { tool } from "@openai/agents";
import { z } from "zod";
import type { MarkdownAgentContext } from "../context.ts";
import { getBlockContent } from "../core/get_block_content.ts";

export const expandBlockTool = tool({
  name: "expand_block",
  description: "Expands content of a block",
  parameters: z.object({
    blockId: z.number(),
  }),
  execute: ({ blockId }, ctx?: MarkdownAgentContext) => {
    const { markdown, ast } = ctx!.context;
    const block = ast.children[blockId];

    if (!block) {
      return "Block not found";
    }

    return getBlockContent(markdown, block);
  },
});
