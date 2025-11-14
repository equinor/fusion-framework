import type {
  VectorStoreDocument,
  VectorStoreDocumentMetadata,
} from '@equinor/fusion-framework-module-ai/lib';

/**
 * Markdown document metadata
 */
export type MarkdownMetadata<T extends Record<string, unknown> = Record<string, unknown>> =
  VectorStoreDocumentMetadata<
    T & {
      type: 'markdown';
    }
  >;

/**
 * Markdown document
 */
export type MarkdownDocument<T extends Record<string, unknown> = Record<string, unknown>> =
  VectorStoreDocument<MarkdownMetadata<T>>;

