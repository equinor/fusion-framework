import type {
  VectorStoreDocument,
  VectorStoreDocumentMetadata,
} from '@equinor/fusion-framework-module-ai/lib';

/**
 * Metadata shape for documents generated from TypeScript source files.
 *
 * Extends the base vector-store metadata with TSDoc-specific fields.
 */
export type TypescriptMetadata = VectorStoreDocumentMetadata<{
  /** Discriminator identifying the document as extracted from TSDoc. */
  type: 'tsdoc';
  /** The `ts-morph` syntax-kind name (e.g. `'FunctionDeclaration'`). */
  ts_kind: string;
  /** Name of the TypeScript symbol (function, class, interface, etc.). */
  ts_name: string;
}>;

/**
 * A vector-store document originating from a TypeScript source file.
 *
 * Contains the extracted TSDoc comment (and optionally the type signature)
 * together with {@link TypescriptMetadata}.
 */
export type TypescriptDocument = VectorStoreDocument<TypescriptMetadata>;

/**
 * Options for controlling TypeScript document parsing behaviour.
 */
export interface ParseTsDocOptions {
  /** Absolute path to the project root, used to compute relative source paths. */
  projectRoot?: string;
}
