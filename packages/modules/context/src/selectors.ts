import { ApiVersion, ApiContextEntity } from '@equinor/fusion-framework-module-services/context';
import type { GetContextResponse } from '@equinor/fusion-framework-module-services/context/get';
import type { QueryContextResponse } from '@equinor/fusion-framework-module-services/context/query';
import type { RelatedContextResponse } from '@equinor/fusion-framework-module-services/context/related';
import type { ContextItem, ContextItemType } from './types';

const parseContextType = (type: GetContextResponse<'v1'>['type']): ContextItemType => ({
    id: type.id,
    isChildType: type.isChildType,
    parentTypeIds: type.parentTypeIds ?? [],
});

const parseContextItem = (item: ApiContextEntity<ApiVersion.v1>): ContextItem => {
    return {
        id: item.id,
        externalId: item.externalId ?? undefined,
        isActive: item.isActive,
        isDeleted: item.isDeleted,
        created: new Date(item.created),
        source: item.source ?? undefined,
        title: item.title ?? undefined,
        type: parseContextType(item.type),
        // TODO
        value: item.value ?? {},
    };
};

export const getContextSelector = async (response: Response): Promise<ContextItem> => {
    const result = (await response.json()) as GetContextResponse<'v1'>;
    return parseContextItem(result);
};

export const queryContextSelector = async (response: Response): Promise<ContextItem[]> => {
    const result = (await response.json()) as QueryContextResponse<'v1'>;
    return result.map(parseContextItem);
};

export const relatedContextSelector = async (response: Response): Promise<ContextItem[]> => {
    const result = (await response.json()) as RelatedContextResponse<'v1'>;
    return result.map(parseContextItem);
};
