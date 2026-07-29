import type { SourceFile as ProjectSourceFile } from 'ts-morph';

import { generateChunkId } from '../generate-chunk-id.js';
import type { TypescriptDocument, ParseTsDocOptions } from './types.js';

/**
 * Creates a TypescriptDocument from the given parameters.
 * @param sourceFile - The source file containing the node.
 * @param pageContent - The content of the document.
 * @param tsKind - The TypeScript node kind name.
 * @param tsName - The name of the TypeScript node.
 * @param options - Optional parsing configuration.
 * @returns A TypeScript document with metadata.
 */
export const createTypescriptDocument = (
  sourceFile: ProjectSourceFile,
  pageContent: string,
  tsKind: string,
  tsName: string,
  options?: ParseTsDocOptions,
): TypescriptDocument => {
  const source = sourceFile.getFilePath().replace(/^\/+/, '');
  return {
    id: generateChunkId(source),
    pageContent,
    metadata: {
      source,
      ...(options?.projectRoot && { rootPath: options.projectRoot }),
      attributes: {
        type: 'tsdoc',
        ts_kind: tsKind,
        ts_name: tsName,
      },
    },
  };
};
