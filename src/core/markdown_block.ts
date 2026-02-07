import type { RootContent } from "mdast";

export type MarkdownBlockOptions = Readonly<{
  id: number;
  node: RootContent;
  fullDocument: string;
}>;

export class MarkdownBlock {
  readonly id: number;
  readonly node: RootContent;
  readonly doc: string;

  constructor(
    { id, node, fullDocument }: MarkdownBlockOptions,
  ) {
    this.id = id;
    this.node = node;
    this.doc = fullDocument;
  }

  get type(): RootContent["type"] {
    return this.node.type;
  }

  get docOffset(): number {
    return this.node.position!.start.offset!;
  }

  get length(): number {
    return this.node.position!.end.offset! - this.docOffset;
  }

  get content(): string {
    return this.doc.slice(this.docOffset, this.docOffset + this.length);
  }

  getPreview = (suffix = "..."): string | undefined =>
    this.length > 80
      ? `${this.doc.slice(this.docOffset, this.docOffset + 80)}${suffix}`
      : undefined;
}
