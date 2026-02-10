import { tool } from "@openai/agents";
import { z } from "zod";
import type { MarkdownAgentContext } from "../context.ts";
import { iterSiblingSections } from "../core/iter_sibling_sections.ts";
import { getBlockContent } from "../core/get_block_content.ts";
import { getSectionContentLength } from "../core/get_section_content_length.ts";
import { iterUntilNextSection } from "../core/iter_until_next_section.ts";

export const expandSectionTool = tool({
  name: "expand_section",
  description: "Expands content of a section",
  parameters: z.object({ sectionId: z.number() }),
  execute: ({ sectionId }, ctx?: MarkdownAgentContext) => {
    const { markdown, ast } = ctx!.context;
    const heading = ast.children[sectionId];

    if (heading?.type !== "heading") {
      return "Section not found";
    }

    const blocksStart = sectionId + 1;
    const blocks = Array.from(
      iterUntilNextSection(blocksStart, ast).map((v, i) => {
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
      iterSiblingSections({
        startIndex: sectionsStart,
        ast,
        level: heading.depth + 1,
      }).map((v) => ({
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
