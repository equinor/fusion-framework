import { ApiVersion, ApiContextEntity } from '@equinor/fusion-framework-module-services/context';
import type { GetContextResponse } from '@equinor/fusion-framework-module-services/context/get';
import type { QueryContextResponse } from '@equinor/fusion-framework-module-services/context/query';
import type { RelatedContextResponse } from '@equinor/fusion-framework-module-services/context/related';
import type { ContextItem, ContextItemType } from './types';

/**
 * Parses the context type from the response of the GetContext API.
 *
 * @param type The type property from the GetContext response.
 * @returns The parsed context item type.
 */
const parseContextType = (type: GetContextResponse<'v1'>['type']): ContextItemType => ({
    id: type.id,
    isChildType: type.isChildType,
    parentTypeIds: type.parentTypeIds ?? [],
});

/**
 * Parses an ApiContextEntity object into a ContextItem object.
 * @param item The ApiContextEntity object to parse.
 * @returns The parsed ContextItem object.
 */
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

/**
 * Parse the response from the GetContext API into a context item.
 * @param response The response object containing the context item.
 * @returns A promise that resolves to the context item.
 */
export const getContextSelector = async (response: Response): Promise<ContextItem> => {
    const result = (await response.json()) as GetContextResponse<'v1'>;
    return parseContextItem(result);
};

/**
 * Parse the response from the QueryContext API into an array of context items.
 * @param response The response object.
 * @returns A promise that resolves to an array of context items.
 */
export const queryContextSelector = async (response: Response): Promise<ContextItem[]> => {
    const result = (await response.json()) as QueryContextResponse<'v1'>;
    return result.map(parseContextItem);
};

/**
 * Parse the response from the RelatedContext API into an array of context items.
 * @param response The response object containing the related context items.
 * @returns A promise that resolves to an array of ContextItem objects.
 */
export const relatedContextSelector = async (response: Response): Promise<ContextItem[]> => {
    const result = (await response.json()) as RelatedContextResponse<'v1'>;
    return result.map(parseContextItem);
};
