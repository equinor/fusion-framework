/**
 * Represents an item within a context, holding various properties and metadata.
 *
 * @template TType - The type of the value held by the context item, defaulting to a generic record.
 */
export type ContextItem<TType extends Record<string, unknown> = Record<string, unknown>> = {
    /** Unique identifier for the context item. */
    id: string;
    /** Optional external identifier for the context item. */
    externalId?: string;
    /** The source from where the context item is derived. */
    source?: string;
    /** The type of the context item, defining its characteristics. */
    type: ContextItemType;
    /** The value associated with the context item, conforming to the TType structure. */
    value: TType;
    /** The main title or name of the context item. */
    title?: string;
    /** A secondary title or descriptive label for the context item. */
    subTitle?: string;
    /** Indicates whether the context item is currently active or relevant. */
    isActive?: boolean;
    /** Flags whether the context item has been marked as deleted. */
    isDeleted?: boolean;
    /** The creation date of the context item. */
    created?: Date;
    /** The last updated date of the context item. */
    updated?: Date;
    /** A URL or identifier for an associated graphic or visual representation. */
    graphic?: string;
    /** A string that can hold any additional metadata or information. */
    meta?: string;
};

export interface ContextItemType {
    /** Unique identifier for the context item type. */
    id: string;
    /** Indicates if the context item type is a child type. */
    isChildType?: boolean;
    /** An array of parent type identifiers if applicable. */
    parentTypeIds?: string[];
}

export type QueryContextParameters = {
    search?: string;
    filter?: {
        type?: string[];
        externalId?: string;
    };
};

export type RelatedContextParameters<T extends ContextItem = ContextItem> = {
    item: T;
    filter?: {
        type?: string[];
    };
};

/**
 * A function type that represents a filter operation on an array of context items.
 * It takes an array of `ContextItem` objects as an input and returns a filtered array of `ContextItem` objects.
 */
export type ContextFilterFn = (items: ContextItem[]) => ContextItem[];
