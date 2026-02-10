import { tool } from "@openai/agents";
import { z } from "zod";
import type { MarkdownAgentContext } from "../context.ts";
import { iterSectionsFlat } from "../core/iter_sections_flat.ts";
import { getBlockContent } from "../core/get_block_content.ts";
import { getSectionContentLength } from "../core/get_section_content_length.ts";
import { iterBlocksFlat } from "../core/iter_blocks_flat.ts";

export const expandSectionTool = tool({
  name: "expand_section",
  description: "Expands content of a section",
  parameters: z.object({ sectionId: z.number() }),
  execute: ({ sectionId }, ctx?: MarkdownAgentContext) => {
    const { markdown, ast } = ctx!.context;

    if (ast.children[sectionId]?.type !== "heading") {
      return "Section not found";
    }

    const blocksStart = sectionId + 1;
    const blocks = Array.from(
      iterBlocksFlat(blocksStart, ast).map((v, i) => {
        const type = v.type;
        const content = getBlockContent(markdown, v);
        const { length } = content;

        if (length > 80) {
          return {
            id: blocksStart + i,
            type,
            preview: content.slice(0, 80),
            length,
          };
        }

        return { type, content };
      }),
    );

    const sectionsStart = blocksStart + blocks.length;
    const sections = Array.from(
      iterSectionsFlat(sectionsStart, ast).map((v) => ({
        id: v.id,
        heading: getBlockContent(markdown, v.heading),
        contentLength: getSectionContentLength(v),
      })),
    );

    return JSON.stringify({
      blocks,
      sections,
    });
  },
});
