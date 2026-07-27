import { assert } from 'node:console';
import { readFileSync } from 'node:fs';
import { Project } from 'ts-morph';

import type { SourceFile } from '../types.js';
import type { ParseTsDocOptions, TypescriptDocument } from './types.js';
import { isTypescriptFile } from './parser.js';
import { processSourceFile } from './process-source-file.js';

/**
 * Parses TSDoc comments from a TypeScript file on disk.
 *
 * Reads the file synchronously, creates a `ts-morph` project, and returns
 * one {@link TypescriptDocument} per documented top-level declaration.
 *
 * @param file - Source file descriptor with path and optional project root.
 * @param options - Optional parsing configuration.
 * @returns Array of extracted TypeScript documents.
 * @throws {AssertionError} If the file does not have a `.ts` or `.tsx` extension.
 */
export const parseTsDocFromFileSync = (
  file: SourceFile,
  options?: ParseTsDocOptions,
): TypescriptDocument[] => {
  assert(isTypescriptFile(file.path), `File ${file.path} is not a TypeScript file`);
  const project = new Project({ useInMemoryFileSystem: true });
  const sourceFile = project.createSourceFile(
    file.relativePath ?? file.path,
    readFileSync(file.path, 'utf8'),
  );
  return processSourceFile(sourceFile, options);
};
