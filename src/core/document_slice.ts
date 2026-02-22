import type { Root, RootContent } from "mdast";

export class DocumentSlice {
  readonly indices: number[] = [];

  constructor(readonly ast: Root) {}

  get blocks(): RootContent[] {
    return this.indices.map((i) => this.ast.children[i]);
  }

  addBlock(index: number) {
    const insertIndex = this.indices.findIndex((v) => v > index);
    const spliceStart = insertIndex === -1 ? this.indices.length : insertIndex;
    const isDuplicate = this.indices[spliceStart - 1] === index;

    if (!isDuplicate) {
      this.indices.splice(spliceStart, 0, index);
    }
  }

  removeBlock(index: number) {
    const spliceStart = this.indices.findIndex((v) => v === index);

    if (spliceStart !== -1) {
      this.indices.splice(spliceStart, 1);
    }
  }

  pruneEmptySections() {
    for (let i = this.indices.length - 1; i >= 0; i--) {
      const blockIndex = this.indices[i];
      const block = this.ast.children[blockIndex];

      if (block.type !== "heading") continue;

      const prevBlockIndex = this.indices[i + 1];
      const prevBlock = this.ast.children[prevBlockIndex];
      const isEmpty = !prevBlock ||
        (prevBlock.type === "heading" && prevBlock.depth <= block.depth);

      if (isEmpty) {
        this.indices.splice(i, 1);
      }
    }
  }
}
