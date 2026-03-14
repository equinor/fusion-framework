import type {
  VectorStoreDocument,
  VectorStoreDocumentMetadata,
} from '@equinor/fusion-framework-module-ai/lib';

/**
 * Metadata shape for documents generated from Markdown / MDX files.
 *
 * Extends the base vector-store metadata with a `'markdown'` type discriminator
 * and any frontmatter key-value pairs (prefixed with `md_`).
 *
 * @template T - Additional frontmatter attributes.
 */
export type MarkdownMetadata<T extends Record<string, unknown> = Record<string, unknown>> =
  VectorStoreDocumentMetadata<
    T & {
      /** Discriminator identifying the document as extracted from Markdown. */
      type: 'markdown';
    }
  >;

/**
 * A vector-store document originating from a Markdown or MDX file.
 *
 * Contains a text chunk of the markdown content together with
 * {@link MarkdownMetadata}.
 *
 * @template T - Additional frontmatter attributes.
 */
export type MarkdownDocument<T extends Record<string, unknown> = Record<string, unknown>> =
  VectorStoreDocument<MarkdownMetadata<T>>;
