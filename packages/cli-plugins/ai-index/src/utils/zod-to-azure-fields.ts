import type { z } from 'zod';

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
 * underlying Zod type definition.
 *
 * @param def - The `_zod.def` object from a Zod schema node.
 * @returns The innermost non-wrapper definition.
 */
function unwrapDef(def: Record<string, unknown>): Record<string, unknown> {
  const wrapperTypes = new Set(['optional', 'default', 'nullable']);
  // Walk through wrapper layers until we reach the concrete type
  let current = def;
  while (wrapperTypes.has(current.type as string)) {
    const inner = current.innerType as { _zod?: { def: Record<string, unknown> } } | undefined;
    if (!inner?._zod?.def) break;
    current = inner._zod.def;
  }
  return current;
}

/**
 * Map a Zod type definition to its Azure EDM field type.
 *
 * @param def - The unwrapped `_zod.def` object from a Zod schema node.
 * @returns The corresponding Azure EDM type string.
 * @throws {Error} When the Zod type cannot be mapped to an Azure EDM type.
 */
function zodDefToEdmType(def: Record<string, unknown>): AzureEdmType {
  switch (def.type) {
    case 'string':
    case 'enum':
      return 'Edm.String';
    case 'number':
      return 'Edm.Double';
    case 'boolean':
      return 'Edm.Boolean';
    case 'array': {
      const elementDef = (def.element as { _zod?: { def: Record<string, unknown> } })?._zod?.def;
      if (!elementDef) {
        throw new Error('Array schema missing element type definition');
      }
      const innerDef = unwrapDef(elementDef);
      if (innerDef.type === 'string' || innerDef.type === 'enum') {
        return 'Collection(Edm.String)';
      }
      throw new Error(
        `Unsupported array element type "${String(innerDef.type)}". Only string arrays are supported for Azure Search fields.`,
      );
    }
    default:
      throw new Error(
        `Unsupported Zod type "${String(def.type)}" for Azure Search field mapping. ` +
          'Supported types: string, number, boolean, enum, array(string).',
      );
  }
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
  const shape = schema.shape as Record<string, { _zod?: { def: Record<string, unknown> } }>;

  return Object.entries(shape).map(([name, fieldSchema]) => {
    const def = fieldSchema._zod?.def;
    if (!def) {
      throw new Error(`Field "${name}" is missing Zod type definition`);
    }

    // Unwrap wrapper types to reach the concrete type
    const innerDef = unwrapDef(def);
    const edmType = zodDefToEdmType(innerDef);
    const capabilities = defaultCapabilities(edmType);

    return { name, type: edmType, ...capabilities };
  });
}
