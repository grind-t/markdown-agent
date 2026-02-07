import { run } from "@openai/agents";
import { markdownAgent } from "./main.ts";

const result = await run(
  markdownAgent,
  "Fetch https://docs.deno.com/llms.txt and find example of Deno HTTP server",
  { context: { documents: [] } },
);

console.log(JSON.stringify(result.history, null, 2));
console.log(result.finalOutput);
