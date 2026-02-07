import { tool } from "@openai/agents";
import { z } from "zod";
import type { MarkdownAgentContext } from "../context.ts";

export const expandBlockTool = tool({
  name: "expand_block",
  description: "Expands content of a block",
  parameters: z.object({
    documentId: z.number(),
    sectionId: z.number(),
    blockId: z.number(),
  }),
  execute: ({ documentId, sectionId, blockId }, ctx?: MarkdownAgentContext) => {
    const document = ctx?.context.documents.find((v) => v.id === documentId);

    if (!document) {
      return "Document not found";
    }

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
