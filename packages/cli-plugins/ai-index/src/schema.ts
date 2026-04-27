import type { z } from 'zod';
import type { VectorStoreDocument } from '@equinor/fusion-framework-module-ai/lib';

/**
 * Attribute map type used by {@link IndexSchemaConfig.prepareAttributes}.
 *
 * Combines the schema-declared field types (all optional, since
 * attributes are built up incrementally) with a `Record<string, unknown>`
 * base so non-promoted attributes are still accessible.
 *
 * @template T - Zod object schema from which attribute types are derived.
 */
export type SchemaAttributes<T extends z.ZodObject> = Partial<z.input<T>> & Record<string, unknown>;

/**
 * Configuration for a custom Azure AI Search index schema defined via a Zod
 * object shape.
 *
 * Declares which metadata fields should be promoted to top-level Azure AI
 * Search fields (instead of being stored in the generic `attributes` array)
 * and how their values are resolved from each document.
 *
 * Promoted fields become filterable/facetable at the Azure Search level,
 * eliminating the need for `any()` OData operators.
 *
 * @template T - Zod object schema type that defines the promoted field names and types.
 *
 * @example
 * ```ts
 * import { z } from 'zod';
 * import { defineIndexSchema } from '@equinor/fusion-framework-cli-plugin-ai-index';
 *
 * const schema = defineIndexSchema({
 *   shape: z.object({
 *     pkg_name: z.string().optional(),
 *     type: z.string(),
 *     tags: z.array(z.string()).default([]),
 *     source_dir: z.string(),
 *   }),
 *   prepareAttributes: (attrs, doc) => {
 *     // attrs.tags is typed as string[] | undefined ✅
 *     attrs.tags ??= [];
 *     if (doc.metadata.source.includes('packages/')) {
 *       attrs.tags.push('package');
 *     }
 *     return attrs;
 *   },
 *   resolve: (doc) => ({
 *     pkg_name: doc.metadata.attributes?.pkg_name as string | undefined,
 *     type: (doc.metadata.attributes?.type as string) ?? 'unknown',
 *     tags: (doc.metadata.attributes?.tags as string[]) ?? [],
 *     source_dir: doc.metadata.source.split('/')[0],
 *   }),
 * });
 * ```
 */
export interface IndexSchemaConfig<T extends z.ZodObject = z.ZodObject> {
  /**
   * Zod object schema defining the promoted field names and their types.
   *
   * Each key becomes a top-level Azure AI Search field. The Zod type
   * determines the Azure EDM field type:
   * - `z.string()` → `Edm.String` (filterable, facetable)
   * - `z.array(z.string())` → `Collection(Edm.String)` (filterable, facetable)
   * - `z.number()` → `Edm.Double` (filterable, sortable)
   * - `z.boolean()` → `Edm.Boolean` (filterable)
   */
  shape: T;

  /**
   * Type-safe attribute processor that enriches document attributes before
   * the schema resolver runs.
   *
   * Runs in addition to the untyped `metadata.attributeProcessor` callback
   * when a schema is defined. The `attributes` parameter is typed from the
   * Zod shape so that schema-declared fields (e.g. `tags`, `pkg_name`)
   * have proper types while non-schema attributes remain accessible via
   * the `Record<string, unknown>` base.
   *
   * Runs after git and package metadata enrichment and after
   * `metadata.attributeProcessor`, before
   * {@link IndexSchemaConfig.resolve | resolve}.
   *
   * @param attributes - The accumulated attributes for the document, typed
   *   from the schema shape. All schema fields are optional since they may
   *   not be populated yet.
   * @param document - The vector-store document being processed.
   * @returns The enriched attributes map.
   */
  prepareAttributes?: (
    attributes: SchemaAttributes<T>,
    document: VectorStoreDocument,
  ) => SchemaAttributes<T>;

  /**
   * Per-document resolver that extracts or computes promoted field values.
   *
   * Runs after {@link IndexSchemaConfig.prepareAttributes | prepareAttributes}
   * and metadata enrichment (git, package), so all enriched attributes are
   * available on the document.
   *
   * @param document - The fully enriched vector-store document.
   * @returns An object matching the Zod shape with resolved field values.
   */
  resolve: (document: VectorStoreDocument) => z.output<T>;
}

/**
 * Type-safe factory for creating an {@link IndexSchemaConfig}.
 *
 * Infers `T` from the Zod shape and constrains both the
 * `prepareAttributes` parameter types and the `resolve` return type,
 * providing compile-time safety that attribute processing and resolution
 * match the declared schema.
 *
 * @template T - Zod object schema type, inferred from `config.shape`.
 * @param config - Schema configuration with a Zod shape, optional typed
 *   attribute processor, and a resolver function.
 * @returns The same config object, narrowed to the inferred generic type.
 *
 * @example
 * ```ts
 * import { z } from 'zod';
 * import { defineIndexSchema } from '@equinor/fusion-framework-cli-plugin-ai-index';
 *
 * const schema = defineIndexSchema({
 *   shape: z.object({
 *     tags: z.array(z.string()).default([]),
 *     type: z.string(),
 *   }),
 *   prepareAttributes: (attrs, doc) => {
 *     attrs.tags ??= []; // string[] | undefined — type-safe ✅
 *     if (doc.metadata.source.includes('cookbooks/')) {
 *       attrs.tags.push('cookbook');
 *     }
 *     return attrs;
 *   },
 *   resolve: (doc) => ({
 *     tags: (doc.metadata.attributes?.tags as string[]) ?? [],
 *     type: (doc.metadata.attributes?.type as string) ?? 'raw',
 *   }),
 * });
 * ```
 */
export function defineIndexSchema<T extends z.ZodObject>(
  config: IndexSchemaConfig<T>,
): IndexSchemaConfig<T> {
  return config;
}
