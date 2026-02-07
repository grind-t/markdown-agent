import type { MarkdownBlock } from "./markdown_block.ts";

export type MarkdownSectionOptions = Readonly<{
  id: number;
  heading: MarkdownBlock;
  content: MarkdownBlock[];
}>;

export class MarkdownSection {
  readonly id: number;
  readonly heading: MarkdownBlock;
  readonly content: MarkdownBlock[];

  constructor(
    { id, heading, content }: MarkdownSectionOptions,
  ) {
    this.id = id;
    this.heading = heading;
    this.content = content;
  }

  get contentLength(): number {
    const start = this.content.at(0)?.node.position?.start.offset ?? 0;
    const end = this.content.at(-1)?.node.position?.end.offset ?? 0;
    return end - start;
  }
}
