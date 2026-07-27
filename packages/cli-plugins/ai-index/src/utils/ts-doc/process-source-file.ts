import type { SourceFile as ProjectSourceFile } from 'ts-morph';

import type { TypescriptDocument, ParseTsDocOptions } from './types.js';
import { extractDocumentFromNode } from './extract-document-from-node.js';

/**
 * Walks a TypeScript source file and extracts a {@link TypescriptDocument}
 * for every top-level declaration that carries a TSDoc comment.
 *
 * @param sourceFile - The `ts-morph` source file to traverse.
 * @param options - Optional parsing configuration.
 * @returns Array of extracted documents (one per documented declaration).
 */
export const processSourceFile = (
  sourceFile: ProjectSourceFile,
  options?: ParseTsDocOptions,
): TypescriptDocument[] => {
  const documents: TypescriptDocument[] = [];

  sourceFile.forEachDescendant((node) => {
    // Collect a document for every descendant node that carries a documentable TSDoc comment
    const document = extractDocumentFromNode(node, sourceFile, options);
    // Skip nodes that produced no document (undocumented or unsupported kind)
    if (document) {
      documents.push(document);
    }
  });

  return documents;
};
