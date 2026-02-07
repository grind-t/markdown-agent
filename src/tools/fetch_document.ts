import { tool } from "@openai/agents";
import { z } from "zod";
import type { MarkdownAgentContext } from "../context.ts";
import { MarkdownDocument } from "../core/markdown_document.ts";

export const fetchDocumentTool = tool({
  name: "fetch_document",
  description: "Fetches a markdown document from a URL",
  parameters: z.object({ url: z.string() }),
  execute: async ({ url }, ctx?: MarkdownAgentContext) => {
    try {
      const response = await fetch(url);
      const text = await response.text().catch(() => "");

      if (!response.ok) {
        const error = text || response.statusText;
        return `Cannot fetch document from ${url}: ${error}`;
      }

      if (!text) {
        return "Document is empty";
      }

      const documents = ctx?.context.documents;
      const id = documents?.length ?? 0;
      const document = new MarkdownDocument({ id, text });
      const sections = document.sections.map((section) => ({
        id: section.id,
        heading: section.heading.content,
        contentLength: section.contentLength,
      }));

      documents?.push(document);

      return JSON.stringify({ id, sections });
    } catch (error) {
      return error instanceof Error ? error.message : String(error);
    }
  },
});
