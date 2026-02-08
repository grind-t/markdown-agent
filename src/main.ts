import { Agent } from "@openai/agents";
import { expandSectionTool } from "./tools/expand_section.ts";
import { expandBlockTool } from "./tools/expand_block.ts";

export const markdownAgent = new Agent({
  name: "Markdown agent",
  instructions: (ctx) => {
    const document = ctx.context!;
    const sections = document.sections.map((section) => ({
      id: section.id,
      heading: section.heading.content,
      contentLength: section.contentLength,
    }));
    const sectionsJson = JSON.stringify(sections);

    return `You are given a markdown document with the following sections:\n${sectionsJson}\nYour task is to find the information the user is looking for, or state that it is not present.`;
  },
  tools: [expandSectionTool, expandBlockTool],
});
