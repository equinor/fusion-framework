import { map } from 'rxjs';
import type { Observable } from 'rxjs';
import type { VectorStoreDocument } from '@equinor/fusion-framework-module-ai/lib';
import type { IndexSchemaConfig } from '../schema.js';

/**
 * Creates an RxJS operator that resolves promoted schema fields for each
 * document and separates them from the generic `attributes` bag.
 *
 * For each document in the batch:
 * 1. Runs the optional `prepareAttributes` callback to enrich attributes
 *    with type-safe access to schema-declared fields
 * 2. Calls the schema resolver to compute promoted field values
 * 3. Validates the resolved values against the Zod shape
 * 4. Stores promoted fields on `metadata.schemaFields`
 * 5. Removes promoted keys from `metadata.attributes` to avoid duplication
 *
 * When no schema is configured, the stream passes through unchanged.
 *
 * @param document$ - Stream of document batches from the metadata enrichment step.
 * @param schema - The index schema config, if defined. When `undefined`, documents pass through unchanged.
 * @returns Stream of document batches with promoted fields resolved and stored.
 */
export function applySchema(
  document$: Observable<VectorStoreDocument[]>,
  schema: IndexSchemaConfig | undefined,
): Observable<VectorStoreDocument[]> {
  // No schema configured — pass through unchanged (backward compatible)
  if (!schema) {
    return document$;
  }

  const promotedKeys = new Set(Object.keys(schema.shape.shape as Record<string, unknown>));

  return document$.pipe(
    map((documents) =>
      documents.map((document) => {
        // Run typed attribute processor before schema resolution so the
        // resolver receives fully enriched attributes
        let enrichedDocument = document;
        if (schema.prepareAttributes) {
          const enrichedAttributes = schema.prepareAttributes(
            (document.metadata.attributes ?? {}) as Record<string, unknown>,
            document,
          );
          enrichedDocument = {
            ...document,
            metadata: {
              ...document.metadata,
              attributes: enrichedAttributes as Record<string, unknown>,
            },
          };
        }

        // Resolve promoted field values from the fully enriched document
        const resolved = schema.resolve(enrichedDocument);

        // Validate against the Zod shape — throws on invalid data with
        // a clear error message pointing to the offending field
        const validated = schema.shape.parse(resolved) as Record<string, unknown>;

        // Remove promoted keys from attributes to avoid storing them
        // in both top-level fields and the generic attributes array
        const currentAttributes = (enrichedDocument.metadata.attributes ?? {}) as Record<
          string,
          unknown
        >;
        const remainingAttributes: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(currentAttributes)) {
          if (!promotedKeys.has(key)) {
            remainingAttributes[key] = value;
          }
        }

        return {
          ...enrichedDocument,
          metadata: {
            ...enrichedDocument.metadata,
            attributes: remainingAttributes,
            schemaFields: validated,
          },
        };
      }),
    ),
  );
}
