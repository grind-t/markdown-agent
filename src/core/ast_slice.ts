import type { Root } from "mdast";

export class AstSlice {
  readonly indices: number[] = [];

  constructor(readonly ast: Root) {}

  addBlock(index: number) {
    const insertIndex = this.indices.findIndex((v) => v > index);
    const spliceStart = insertIndex === -1 ? this.indices.length : insertIndex;
    const isDuplicate = this.indices[spliceStart - 1] === index;

    if (!isDuplicate) {
      this.indices.splice(spliceStart, 0, index);
    }
  }

  removeBlock(index: number) {
    const removeIndex = this.indices.findIndex((i) => i === index);

    if (removeIndex === -1) return;

    const block = this.ast.children[removeIndex];

    if (block.type !== "heading") {
      this.indices.splice(removeIndex, 1);
      return;
    }

    let deleteCount = 1;

    for (let i = removeIndex + 1; i < this.indices.length; i++) {
      const nextBlock = this.ast.children[i];

      if (nextBlock.type === "heading" && nextBlock.depth <= block.depth) {
        break;
      }

      deleteCount++;
    }

    this.indices.splice(removeIndex, deleteCount);
  }
}
