import { assert } from 'node:console';
import { readFileSync } from 'node:fs';
import { Project } from 'ts-morph';

import type { SourceFile } from '../types.js';
import type { TypescriptDocument, ParseTsDocOptions } from './types.js';
import { processSourceFile } from './extractors.js';

/**
 * Checks whether a file path has a TypeScript (`.ts`) or TSX (`.tsx`) extension.
 *
 * @param filePath - Absolute or relative file path.
 * @returns `true` if the file extension is `.ts` or `.tsx`.
 */
export const isTypescriptFile = (filePath: string): boolean => {
  return filePath.endsWith('.ts') || filePath.endsWith('.tsx');
};

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
