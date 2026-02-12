import { Agent } from "@openai/agents";
import { expandSectionTool } from "./tools/expand_section.ts";
import { expandBlockTool } from "./tools/expand_block.ts";
import { iterSiblingSections } from "./core/ast/iter_sibling_sections.ts";
import { getBlockContent } from "./core/ast/get_block_content.ts";
import { getSectionContentLength } from "./core/ast/get_section_content_length.ts";

export const markdownAgent = new Agent({
  name: "Markdown agent",
  instructions: (ctx) => {
    const { markdown, ast } = ctx.context!;
    const sections = Array.from(
      iterSiblingSections({ startIndex: 0, ast, level: 1 }).map((v) => ({
        id: v.id,
        heading: getBlockContent(markdown, v.heading),
        contentLength: getSectionContentLength(v),
      })),
    );
    const sectionsJson = JSON.stringify(sections);

    return `You are given a markdown document with the following sections:\n${sectionsJson}\nYour task is to find the information the user is looking for, or state that it is not present.`;
  },
  tools: [expandSectionTool, expandBlockTool],
});
