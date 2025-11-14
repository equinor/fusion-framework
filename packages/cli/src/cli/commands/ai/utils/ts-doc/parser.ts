import { assert } from 'node:console';
import { readFileSync } from 'node:fs';
import { Project } from 'ts-morph';

import type { SourceFile } from '../types.js';
import type { TypescriptDocument, ParseTsDocOptions } from './types.js';
import { processSourceFile } from './extractors.js';

/**
 * Checks if a file is a TypeScript or TSX file based on its extension.
 * @param filePath - The path to the file.
 * @returns True if the file ends with .ts or .tsx, false otherwise.
 */
export const isTypescriptFile = (filePath: string): boolean => {
  return filePath.endsWith('.ts') || filePath.endsWith('.tsx');
};

/**
 * Parses TSDoc from a string of TypeScript code.
 * @param content - The TypeScript code content.
 * @param options - Optional parsing configuration.
 * @returns An array of TypeScript documents with TSDoc metadata.
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
 * Parses TSDoc from a TypeScript file by path.
 * @param file - The source file object.
 * @param options - Optional parsing configuration.
 * @returns An array of TypeScript documents with TSDoc metadata.
 * @throws If the file is not a TypeScript file.
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

