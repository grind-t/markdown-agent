import { fromMarkdown } from "mdast-util-from-markdown";
import { iterSiblingSections } from "./src/core/iter_sibling_sections.ts";

const md = await fetch("https://docs.deno.com/llms-full.txt").then((v) =>
  v.text()
);
const ast = fromMarkdown(md);

const sections = [
  {
    list: ["# Fundamentals"],
    regex: /^URL: https:\/\/docs\.deno\.com\/runtime\/fundamentals\//m,
  },
  {
    list: ["# Reference guides"],
    regex: /^URL: https:\/\/docs\.deno\.com\/runtime\/reference\//m,
  },
  {
    list: ["# Examples"],
    regex: /^URL: https:\/\/docs\.deno\.com\/examples\//m,
  },
  {
    list: ["# Lint rules"],
    regex: /^URL: https:\/\/docs\.deno\.com\/lint\/rules\//m,
  },
  {
    list: ["# Standard libraries"],
    regex: /^URL: https:\/\/docs\.deno\.com\/runtime\/reference\/std\//m,
  },
  {
    list: ["# CLI"],
    regex: /^URL: https:\/\/docs\.deno\.com\/runtime\/reference\/cli\//m,
  },
];

for (const section of iterSiblingSections({ ast, startIndex: 0, level: 1 })) {
  const start = section.heading.position?.start.offset ?? 0;
  const end = section.content.at(-1)?.position?.end.offset ??
    section.heading.position?.end.offset ?? 0;
  const content = md.slice(start, end);

  for (let i = sections.length - 1; i >= 0; i--) {
    if (sections[i].regex.test(content)) {
      sections[i].list.push(tab(content));
      break;
    }
  }
}

Deno.writeTextFileSync("md.md", sections.flatMap((v) => v.list).join("\n\n"));

function tab(content: string) {
  return content.split("\n").map((line) =>
    line.startsWith("#") ? "#" + line : line
  ).join("\n");
}
