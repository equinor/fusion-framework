import {
  type z,
  ZodString,
  ZodNumber,
  ZodBoolean,
  ZodArray,
  ZodEnum,
  ZodOptional,
  ZodDefault,
  ZodNullable,
  type ZodType,
} from 'zod';

/**
 * Azure AI Search EDM (Entity Data Model) type identifiers used in
 * index field definitions.
 */
type AzureEdmType =
  | 'Edm.String'
  | 'Edm.Int32'
  | 'Edm.Int64'
  | 'Edm.Double'
  | 'Edm.Boolean'
  | 'Collection(Edm.String)';

/**
 * Azure AI Search field definition matching the REST API schema for
 * index creation.
 *
 * @see https://learn.microsoft.com/en-us/rest/api/searchservice/indexes/create
 */
export interface AzureSearchField {
  /** Field name as it appears in the index schema. */
  name: string;
  /** Azure EDM type for the field. */
  type: AzureEdmType;
  /** Whether the field can be used in `$filter` expressions. */
  filterable: boolean;
  /** Whether the field can be used in `$orderby` expressions. */
  sortable: boolean;
  /** Whether the field supports faceted navigation. */
  facetable: boolean;
  /** Whether the field is included in full-text search. */
  searchable: boolean;
}

/**
 * Unwrap wrapper types (optional, default, nullable) to reach the
 * underlying concrete Zod type.
 *
 * Uses public `instanceof` checks and `unwrap()` methods to avoid
 * reliance on Zod's private `_zod.def` internals.
 *
 * @param schema - A Zod schema node, possibly wrapped.
 * @returns The innermost non-wrapper schema.
 */
function unwrapSchema(schema: ZodType): ZodType {
  let current: ZodType = schema;
  // Walk through wrapper layers until we reach a concrete type
  while (
    current instanceof ZodOptional ||
    current instanceof ZodDefault ||
    current instanceof ZodNullable
  ) {
    current = current.unwrap() as ZodType;
  }
  return current;
}

/**
 * Map a concrete (unwrapped) Zod schema to its Azure EDM field type.
 *
 * Uses public `instanceof` checks against Zod's exported class hierarchy
 * for forward-compatible type mapping.
 *
 * @param schema - The unwrapped Zod schema node.
 * @returns The corresponding Azure EDM type string.
 * @throws {Error} When the Zod type cannot be mapped to an Azure EDM type.
 */
function zodToEdmType(schema: ZodType): AzureEdmType {
  if (schema instanceof ZodString || schema instanceof ZodEnum) {
    return 'Edm.String';
  }
  if (schema instanceof ZodNumber) {
    return 'Edm.Double';
  }
  if (schema instanceof ZodBoolean) {
    return 'Edm.Boolean';
  }
  if (schema instanceof ZodArray) {
    const elementSchema = unwrapSchema(schema.element as ZodType);
    if (elementSchema instanceof ZodString || elementSchema instanceof ZodEnum) {
      return 'Collection(Edm.String)';
    }
    throw new Error(
      `Unsupported array element type "${elementSchema.constructor.name}". Only string arrays are supported for Azure Search fields.`,
    );
  }
  throw new Error(
    `Unsupported Zod type "${schema.constructor.name}" for Azure Search field mapping. ` +
      'Supported types: ZodString, ZodNumber, ZodBoolean, ZodEnum, ZodArray(ZodString).',
  );
}

/**
 * Derive default field capabilities from an Azure EDM type.
 *
 * All promoted fields are filterable. Strings and string collections are
 * also facetable. Numbers are sortable.
 *
 * @param edmType - The Azure EDM type of the field.
 * @returns Default capability flags for the field.
 */
function defaultCapabilities(
  edmType: AzureEdmType,
): Pick<AzureSearchField, 'filterable' | 'sortable' | 'facetable' | 'searchable'> {
  switch (edmType) {
    case 'Edm.String':
      return { filterable: true, sortable: false, facetable: true, searchable: false };
    case 'Collection(Edm.String)':
      return { filterable: true, sortable: false, facetable: true, searchable: false };
    case 'Edm.Double':
    case 'Edm.Int32':
    case 'Edm.Int64':
      return { filterable: true, sortable: true, facetable: false, searchable: false };
    case 'Edm.Boolean':
      return { filterable: true, sortable: false, facetable: false, searchable: false };
    default:
      return { filterable: true, sortable: false, facetable: false, searchable: false };
  }
}

/**
 * Convert a Zod object schema into an array of Azure AI Search field
 * definitions.
 *
 * Walks the Zod shape, maps each field to its Azure EDM type, and assigns
 * default capabilities (filterable, facetable, sortable). Used by the
 * `ffc ai index create` command to generate the index schema.
 *
 * Uses public `instanceof` checks and `unwrap()` methods to avoid
 * reliance on Zod's private `_zod.def` internals, ensuring compatibility
 * across Zod versions.
 *
 * @param schema - A Zod object schema whose keys define the promoted fields.
 * @returns An array of Azure AI Search field definitions.
 * @throws {Error} When a field type cannot be mapped to an Azure EDM type.
 *
 * @example
 * ```ts
 * import { z } from 'zod';
 * import { zodToAzureFields } from './zod-to-azure-fields.js';
 *
 * const fields = zodToAzureFields(
 *   z.object({
 *     pkg_name: z.string().optional(),
 *     tags: z.array(z.string()).default([]),
 *   }),
 * );
 * // [
 * //   { name: 'pkg_name', type: 'Edm.String', filterable: true, facetable: true, ... },
 * //   { name: 'tags', type: 'Collection(Edm.String)', filterable: true, facetable: true, ... },
 * // ]
 * ```
 */
export function zodToAzureFields(schema: z.ZodObject): AzureSearchField[] {
  const shape = schema.shape as Record<string, ZodType>;

  return Object.entries(shape).map(([name, fieldSchema]) => {
    // Unwrap wrapper types to reach the concrete type
    const innerSchema = unwrapSchema(fieldSchema);
    const edmType = zodToEdmType(innerSchema);
    const capabilities = defaultCapabilities(edmType);

    return { name, type: edmType, ...capabilities };
  });
}
