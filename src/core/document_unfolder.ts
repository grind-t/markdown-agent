import type { Root } from "mdast";
import { DocumentSlice } from "./document_slice.ts";
import { assert } from "@std/assert";

export class DocumentUnfolder {
  #slice: DocumentSlice;
  #currentLevel: number;

  constructor(readonly ast: Root) {
    this.#slice = new DocumentSlice(ast);
    this.#currentLevel = 0;
  }

  get slice() {
    return this.#slice;
  }

  get currentLevel() {
    return this.#currentLevel;
  }

  unfoldNextLevel() {
    if (!this.#currentLevel) {
      this.#unfoldRoot();
      this.#currentLevel = 1;
      return;
    }

    for (let i = this.#slice.indices.length - 1; i >= 0; i--) {
      const blockIndex = this.#slice.indices[i];
      const block = this.ast.children[blockIndex];

      if (block.type === "heading" && block.depth === this.#currentLevel) {
        this.#unfoldSection(blockIndex);
      }
    }

    this.#currentLevel++;
  }

  #unfoldRoot() {
    for (let i = 0; i < this.ast.children.length; i++) {
      const block = this.ast.children[i];

      if (block.type === "heading" && block.depth === 1) {
        this.#slice.addBlock(i);
      }
    }
  }

  #unfoldSection(headingIndex: number) {
    const heading = this.ast.children[headingIndex];
    assert(heading.type === "heading");

    let i = headingIndex + 1;

    for (; i < this.ast.children.length; i++) {
      const block = this.ast.children[i];

      if (block.type === "heading") break;

      this.#slice.addBlock(i);
    }

    for (; i < this.ast.children.length; i++) {
      const block = this.ast.children[i];

      if (block.type === "heading" && block.depth <= heading.depth) {
        break;
      }

      if (block.type === "heading" && block.depth === heading.depth + 1) {
        this.#slice.addBlock(i);
      }
    }
  }
}
