// Re-export all types
export type { TypescriptMetadata, TypescriptDocument, ParseTsDocOptions } from './types.js';

// Re-export parser functions
export { isTypescriptFile } from './is-typescript-file.js';
export { parseTsDocSync } from './parse-ts-doc-sync.js';
export { parseTsDocFromFileSync } from './parse-ts-doc-from-file-sync.js';
