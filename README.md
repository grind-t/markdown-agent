# Markdown DB

Proof-of-concept hierarchical retrieval over Markdown documents, based on the algorithm described in [`paper-en.md`](./paper-en.md).

## What This Repository Implements

This repository implements the paper workflow as code:

1. Expand the document one nesting level at a time.
2. Score visible elements as `low` / `medium` / `high` for query relevance.
3. Prune non-relevant elements (current implementation keeps only `high`).
4. Repeat until there is nothing left to expand.
5. Return remaining Markdown as relevant context, or `Nothing relevant`.

## Quick Start (Minimal Install + Playground)

Prerequisites:

- Deno installed (v2+ recommended)
- `OPENAI_API_KEY` available in environment

Run the playground:

```bash
deno run -A --env-file playground.ts
```

What it does:

- Fetches a real Markdown corpus.
- Runs `queryMarkdown(...)` with an OpenAI-based scorer.
- Writes input and output artifacts:
  - `playground-in.md`
  - `playgorund-out.md`

Note: the output filename is currently `playgorund-out.md` (matching the existing script).

## Use Cases

- Large markdown file semantic search (for files like `llms-full.txt`)
- Knowledge bases and memory for AI agents
- Dynamic RAG

## License

MIT
