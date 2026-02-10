import {
  Agent,
  type AgentInputItem,
  createMCPToolStaticFilter,
  MCPServerStdio,
  run,
  user,
} from "@openai/agents";
import { multilinePrompt } from "@grind-t/agents-as-cli";

const instructions = `
You are a coding agent on a project to build an agent for working with Markdown files.

The project uses the following technology stack:
- Deno + TypeScript as the runtime
- @openai/agents as the SDK for building the agent

The goal of the project is to implement an agent that can efficiently work with large Markdown files (for example, llms-full.txt) by incrementally exploring the document structure (headings, sections, and blocks).
`;

const serena = new MCPServerStdio({
  name: "serena",
  fullCommand:
    `uvx --from git+https://github.com/oraios/serena serena start-mcp-server --project-from-cwd --context agent --mode no-onboarding --log-level ERROR`,
  timeout: 10000,
  toolFilter: createMCPToolStaticFilter({
    blocked: [
      "prepare_for_new_conversation",
      "onboarding",
      "check_onboarding_performed",
      "activate_project",
    ],
  }),
});

const coder = new Agent({
  name: "markdown-agent-project coder",
  instructions,
  model: "gpt-5.2",
  modelSettings: {
    text: { verbosity: "low" },
  },
  mcpServers: [serena],
});

try {
  await serena.connect();

  let prompt: string | null = null;
  let history: AgentInputItem[] = [];

  while ((prompt = multilinePrompt(">"))) {
    history.push(user(prompt));
    const response = await run(coder, history);
    console.log(response.finalOutput);
    history = response.history;
  }
} finally {
  await serena.close();
}
