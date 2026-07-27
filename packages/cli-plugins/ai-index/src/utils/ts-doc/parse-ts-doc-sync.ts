import { Project } from 'ts-morph';

import type { ParseTsDocOptions, TypescriptDocument } from './types.js';
import { processSourceFile } from './process-source-file.js';

/**
 * Parses TSDoc comments from an in-memory TypeScript code string.
 *
 * Creates a temporary `ts-morph` project, analyses the source, and returns
 * one {@link TypescriptDocument} per documented top-level declaration.
 *
 * @param content - TypeScript source code to parse.
 * @param options - Optional parsing configuration.
 * @returns Array of extracted TypeScript documents with TSDoc metadata.
 */
export const parseTsDocSync = (
  content: string,
  options?: ParseTsDocOptions,
): TypescriptDocument[] => {
  const project = new Project({ useInMemoryFileSystem: true });
  const sourceFile = project.createSourceFile('temp.ts', content);
  return processSourceFile(sourceFile, options);
};
