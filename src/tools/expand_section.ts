import { tool } from "@openai/agents";
import { z } from "zod";
import type { MarkdownAgentContext } from "../context.ts";

export const expandSectionTool = tool({
  name: "expand_section",
  description: "Expands content of a section",
  parameters: z.object({ sectionId: z.number() }),
  execute: ({ sectionId }, ctx?: MarkdownAgentContext) => {
    const document = ctx!.context;
    const section = document.sections.find((v) => v.id === sectionId);

    if (!section) {
      return "Section not found";
    }

    const blocks = section.content.map((v) => {
      const preview = v.getPreview();

      if (preview) {
        return {
          id: v.id,
          type: v.type,
          preview,
          length: v.length,
        };
      }

      return {
        type: v.type,
        content: v.content,
      };
    });

    return JSON.stringify({ blocks });
  },
});
