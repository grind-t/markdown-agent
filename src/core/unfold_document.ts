import { DocumentSlice } from "./document_slice.ts";
import { getDocumentDepth } from "./get_document_depth.ts";
import { unfoldRoot } from "./unfold_root.ts";
import { unfoldSection } from "./unfold_section.ts";

export function unfoldDocument(doc: DocumentSlice): DocumentSlice {
  const depth = getDocumentDepth(doc.blocks);
  const slice = new DocumentSlice(doc.ast, doc.indices);

  if (!depth) {
    return unfoldRoot(doc.ast);
  }

  for (const index of doc.indices) {
    const block = doc.ast.children[index];

    if (block.type === "heading" && block.depth === depth) {
      const unfolded = unfoldSection({
        ast: doc.ast,
        headingIndex: index,
      });

      unfolded.indices.forEach((v) => slice.addBlock(v));
    }
  }

  return slice;
}
