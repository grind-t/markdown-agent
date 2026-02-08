import type { RunContext } from "@openai/agents";
import type { MarkdownDocument } from "./core/markdown_document.ts";

export type MarkdownAgentContext = RunContext<MarkdownDocument>;
