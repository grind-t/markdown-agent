import type { RunContext } from "@openai/agents";
import type { Root } from "mdast";
import { fromMarkdown } from "mdast-util-from-markdown";
import { EMPTY_HEADING } from "./core/empty_heading.ts";

export type MarkdownAgentContext = RunContext<{
  markdown: string;
  ast: Root;
}>;

export function markdownAgentContext(
  markdown: string,
): MarkdownAgentContext["context"] {
  const ast = fromMarkdown(markdown);

  if (ast.children[0]?.type !== "heading") {
    ast.children.unshift(EMPTY_HEADING);
  }

  return { markdown, ast };
}
