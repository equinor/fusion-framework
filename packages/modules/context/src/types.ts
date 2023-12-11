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
    graphic?: string;
    meta?: string;
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

export type RelatedContextParameters = { item: ContextItem; filter?: { type?: string[] } };

export type ContextFilterFn = (items: ContextItem[]) => ContextItem[];
