import { Agent } from "@openai/agents";
import { fetchDocumentTool } from "./tools/fetch_document.ts";
import { expandSectionTool } from "./tools/expand_section.ts";
import { expandBlockTool } from "./tools/expand_block.ts";

export const markdownAgent = new Agent({
  name: "Markdown agent",
  instructions: "You are an assistant with markdown documents.",
  tools: [fetchDocumentTool, expandSectionTool, expandBlockTool],
});
