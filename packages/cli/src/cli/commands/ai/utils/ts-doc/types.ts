import type {
  VectorStoreDocument,
  VectorStoreDocumentMetadata,
} from '@equinor/fusion-framework-module-ai/lib';

/**
 * TypeScript document metadata
 */
export type TypescriptMetadata = VectorStoreDocumentMetadata<{
  type: 'tsdoc';
  ts_kind: string;
  ts_name: string;
}>;

/**
 * TypeScript document with TSDoc metadata
 */
export type TypescriptDocument = VectorStoreDocument<TypescriptMetadata>;

/**
 * Options for parsing TypeScript documents
 */
export interface ParseTsDocOptions {
  /** The project root path for generating relative paths */
  projectRoot?: string;
}

