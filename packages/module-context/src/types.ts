export type ContextItem<TType extends Record<string, unknown> = Record<string, unknown>> = {
    id: string;
    externalId?: string;
    source?: string;
    type: ContextItemType;
    value: TType;
    title?: string;
    isActive: boolean;
    isDeleted: boolean;
    created: Date;
    updated?: Date;
};

export interface ContextItemType {
    id: string;
    isChildType: boolean;
    parentTypeIds: string[];
}

export type QueryContextParameters = {
    search?: string;
    filter?: {
        type?: string[];
        externalId?: string;
    };
};

export type ContextFilterFn = (items: ContextItem[]) => ContextItem[];
