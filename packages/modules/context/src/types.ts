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

export interface ContextItemType {
  id: string;
  isChildType?: boolean;
  parentTypeIds?: string[];
}

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
