import { z } from 'zod';

/**
 * Builds a schema that faithfully validates the paged-collection envelope
 * Roles API 1.0 wraps around every collection resource, while delegating item
 * validation to the provided `itemSchema`.
 *
 * The envelope is a factory rather than a fixed schema because the item type
 * differs per endpoint; {@link ApiPagedCollectionV1} infers the resulting shape,
 * so the envelope is still declared exactly once.
 *
 * @template TItem - The type of the items contained in the collection.
 * @param itemSchema - Schema used to validate each item in the `value` array.
 * @returns A schema for a page of `TItem`.
 *
 * @example
 * ```ts
 * const pageSchema = apiPagedCollectionSchemaV1(ApiRoleSchemaV1);
 * type RolePage = ApiPagedCollectionV1<ApiRoleV1>;
 * ```
 */
export const apiPagedCollectionSchemaV1 = <TItem>(itemSchema: z.ZodType<TItem>) =>
  z
    .object({
      totalCount: z
        .union([z.number(), z.string()])
        .describe(
          'Total number of records matching the query, returned by the server for client-side pagination.',
        ),
      count: z
        .union([z.number(), z.string()])
        .optional()
        .describe(
          'Number of records in this page. Omitted when the server returns all matching records in one response.',
        ),
      nextPage: z
        .string()
        .nullish()
        .describe('URL of the next page of results, or null/absent when this is the last page.'),
      prevPage: z
        .string()
        .nullish()
        .describe(
          'URL of the previous page of results, or null/absent when this is the first page.',
        ),
      value: z.array(itemSchema).optional().describe('Array of items in this page of results.'),
    })
    .describe(
      'The paged-collection envelope Roles API 1.0 wraps around every collection resource, while delegating item validation to the provided `itemSchema`.',
    );

/**
 * One page of a Roles API 1.0 collection: the `value` array plus the `totalCount`, `count`,
 * `nextPage`, and `prevPage` envelope fields.
 *
 * Inferred from the schema {@link apiPagedCollectionSchemaV1} builds, so the envelope is declared
 * exactly once and `ApiPagedCollectionV1` cannot drift from the runtime validator.
 *
 * @template TItem - The type of the items contained in the collection.
 */
export type ApiPagedCollectionV1<TItem> = z.infer<
  ReturnType<typeof apiPagedCollectionSchemaV1<TItem>>
>;
