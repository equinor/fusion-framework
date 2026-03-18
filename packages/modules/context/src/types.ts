/**
 * Represents a contextual item with associated metadata, value, and optional graphical or meta content.
 *
 * @typeParam TType - The type of the value property, defaults to a generic record.
 * @property id - Unique identifier for the context item.
 * @property externalId - Optional external identifier.
 * @property source - Optional source of the context item.
 * @property type - The type of the context item.
 * @property value - The value associated with the context item.
 * @property title - Optional title for display purposes.
 * @property subTitle - Optional subtitle for display purposes.
 * @property isActive - Optional flag indicating if the item is active.
 * @property isDeleted - Optional flag indicating if the item is deleted.
 * @property created - Optional creation date.
 * @property updated - Optional last updated date.
 * @property graphic - Optional graphical representation, either as a string or an object containing type and content.
 * @property meta - Optional meta information, either as a string or an object containing type and content.
 *
 * @todo - convert to Zod schema for validation and type safety.
 */
export type ContextItem<TType extends Record<string, unknown> = Record<string, unknown>> = {
  id: string;
  externalId?: string;
  source?: string;
  type: ContextItemType;
  value: TType;
  title?: string;
  subTitle?: string;
  isActive?: boolean;
  isDeleted?: boolean;
  created?: Date;
  updated?: Date;
  graphic?:
    | string
    | {
        type: 'html' | 'svg';
        content: string;
      };
  meta?:
    | string
    | {
        type: 'html' | 'svg';
        content: string;
      };
};

/**
 * Describes the type classification of a {@link ContextItem}.
 *
 * Every context item carries a `type` that identifies what kind of
 * entity it represents (e.g. `ProjectMaster`, `Facility`, `Contract`).
 * The optional hierarchy fields indicate parent–child relationships
 * between context types.
 */
export interface ContextItemType {
  /** Unique identifier for the context type (e.g. `'ProjectMaster'`). */
  id: string;
  /** Whether this type is a child of another context type. */
  isChildType?: boolean;
  /** IDs of parent context types, when `isChildType` is `true`. */
  parentTypeIds?: string[];
}

/**
 * Parameters for querying context items from the context API.
 *
 * Used by {@link ContextProvider.queryContext} and the underlying
 * query client to search and filter context results.
 *
 * @property search - Free-text search term.
 * @property filter - Optional structured filters.
 * @property filter.type - Restrict results to specific context type IDs.
 * @property filter.externalId - Filter by an external system identifier.
 */
export type QueryContextParameters = {
  search?: string;
  filter?: {
    type?: string[];
    externalId?: string;
  };
};

/**
 * Parameters for retrieving related context items.
 *
 * @property item - The context item to find relations for.
 * @property filter - Optional filter criteria.
 * @property filter.type - Optional array of types to filter related items by.
 */
export type RelatedContextParameters = { item: ContextItem; filter?: { type?: string[] } };

/**
 * A function type that filters an array of `ContextItem` objects.
 *
 * @param items - The array of `ContextItem` objects to be filtered.
 * @returns A new array of `ContextItem` objects after applying the filter.
 */
export type ContextFilterFn = (items: ContextItem[]) => ContextItem[];
