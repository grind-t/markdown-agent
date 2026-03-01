import { fromMarkdown } from "mdast-util-from-markdown";
import { DocumentSlice } from "./core/document_slice.ts";
import { unfoldDocument } from "./core/unfold_document.ts";
import { formatDocument } from "./core/format_document.ts";
import { getDocumentDepth } from "./core/get_document_depth.ts";
import { getElementString } from "./core/get_element_string.ts";
import { scoreElements, type Scorer } from "./core/score_elements.ts";
import { getBlockString } from "./core/get_block_string.ts";

export async function queryMarkdown(
  markdown: string,
  query: string,
  scorer: Scorer,
): Promise<string> {
  const ast = fromMarkdown(markdown);
  let level = 0;
  let slice = new DocumentSlice(ast);

  while (true) {
    slice = unfoldDocument(slice);
    level++;

    const isLastStep = level > getDocumentDepth(slice.blocks);

    const ids: string[] = [];
    const formattedDocument = formatDocument(
      slice,
      ({ block, ast, index, level: blockLevel }) => {
        const isLastLevel = !isLastStep && (blockLevel === level);

        if (block.type !== "heading" || isLastLevel) {
          ids.push(index.toString());
        }

        return getElementString({
          markdown,
          ast,
          index,
          isLastLevel,
        });
      },
    );

    const scoredElements = await scoreElements({
      ids,
      document: formattedDocument,
      query,
      scorer,
    });

    const discardElements = Object.entries(scoredElements).filter((
      [, score],
    ) => score !== "high");

    for (const [id] of discardElements) {
      const index = Number(id);
      slice.removeBlock(index);
    }

    if (isLastStep) {
      slice.pruneEmptySections();
    }

    if (!slice.indices.length) {
      return "Nothing relevant";
    }

    if (isLastStep) {
      return formatDocument(
        slice,
        ({ block }) => getBlockString(markdown, block),
      );
    }
  }
}
