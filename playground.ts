/*import { fromMarkdown } from "mdast-util-from-markdown";
import { iterSiblingSections } from "./src/core/ast/iter_sibling_sections.ts";
import { getNodeContent } from "./src/core/ast/get_node_content.ts";
import { getSectionContentLength } from "./src/core/ast/get_section_content_length.ts";
import { iterUntilNextSection } from "./src/core/ast/iter_until_next_section.ts";

const md = await fetch("https://docs.deno.com/llms-full.txt").then((v) =>
  v.text()
);
const fast = fromMarkdown(md);

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

for (
  const section of iterSiblingSections({ ast: fast, startIndex: 0, level: 1 })
) {
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

type Item = {
  id: number;
  type: string;
  preview: string;
  length: number;
} | {
  type: string;
  content: string;
} | {
  id: number;
  type: "section";
  heading: string;
  contentLength: number;
};

const markdown = sections.flatMap((v) => v.list).join("\n\n");
const ast = fromMarkdown(markdown);
const ids = [1, 469, 679, 2391, 3260, 5999, 6426, 8922];
ast.children = ast.children.filter((child, i) => ids.includes(i));
console.log(ast.children.map((v) => getNodeContent(markdown, v)));
/*let elements: any[] = iterSiblingSections({
  ast,
  startIndex: 0,
  level: 1,
}).map((v) => ({
  id: v.id,
  type: "section",
  heading: getBlockContent(markdown, v.heading),
  contentLength: getSectionContentLength(v),
}));

for (let i = 0; i < 1; i++) {
  const agent = new Agent({
    name: "Markdown Agent",
    instructions:
      "For each element in the markdown document, evaluate the probability (high, medium, low) that it contains information that will help answer the question 'How to add an npm package to a deno project'. Keep only elements with high probability.",
    model: "gpt-5-mini",
    outputType: z.object({
      result: z.array(
        z.object({
          elementId: z.number(),
          probability: z.union([
            z.literal("low"),
            z.literal("medium"),
            z.literal("high"),
          ]),
        }),
      ),
    }),
  });

  const response = await run(agent, JSON.stringify(Array.from(elements)));
  const filteredIds = response.finalOutput?.result.filter((item) =>
    item.probability === "high"
  ).map((item) => item.elementId);

  elements = elements.filter((v) => filteredIds!.includes(v.id)).flatMap((v) =>
    expand(v)
  );
}

console.log(JSON.stringify(elements, null, 2));

function tab(content: string) {
  return content.split("\n").map((line) =>
    line.startsWith("#") ? "#" + line : line
  ).join("\n");
}

function expand(sectionId: number) {
  const heading = ast.children[sectionId];

  if (heading.type !== "heading") {
    throw new Error(`Expected heading, got ${heading.type}`);
  }

  const elements: any[] = [{
    type: heading.type,
    content: getNodeContent(markdown, heading),
  }];

  iterUntilNextSection({ startIndex: sectionId + 1, ast }).map((v, i) => {
    const type = v.type;
    const content = getNodeContent(markdown, v);
    const { length } = content;

    if (length > 80) {
      return {
        id: sectionId + 1 + i,
        type,
        preview: content.slice(0, 80),
        length,
      };
    }

    return { type, content };
  }).forEach((v) => elements.push(v));

  iterSiblingSections({
    startIndex: sectionId + elements.length,
    ast,
    level: heading.depth + 1,
  }).map((v) => ({
    id: v.id,
    type: "section",
    heading: getNodeContent(markdown, v.heading),
    contentLength: getSectionContentLength(v),
  })).forEach((v) => elements.push(v));

  return elements;
  }*/
