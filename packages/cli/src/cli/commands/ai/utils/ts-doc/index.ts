// Re-export all types
export type { TypescriptMetadata, TypescriptDocument, ParseTsDocOptions } from './types.js';

// Re-export parser functions
export { isTypescriptFile, parseTsDocSync, parseTsDocFromFileSync } from './parser.js';
