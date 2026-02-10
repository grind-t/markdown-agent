import { describe, it } from "@std/testing/bdd";
import { run } from "@openai/agents";
import { markdownAgent } from "./main.ts";
import { assert, assertStringIncludes } from "@std/assert";
import { markdownAgentContext } from "./context.ts";

describe("MarkdownAgent", () => {
  it("should find simple Deno API server example", async () => {
    const url = "https://docs.deno.com/llms.txt";
    const markdown = await fetch(url).then((v) => v.text());
    const context = markdownAgentContext(markdown);

    const result = await run(
      markdownAgent,
      "Find url with simple Deno API server example",
      { context },
    );

    assert(result.finalOutput);
    assertStringIncludes(
      result.finalOutput,
      "https://docs.deno.com/examples/simple_api_tutorial",
    );
  });
});
