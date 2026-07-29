import type {
  ApiVersion,
  ApiContextEntity,
} from '@equinor/fusion-framework-module-services/context';
import type { GetContextResponse } from '@equinor/fusion-framework-module-services/context/get';

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
export const parseContextItem = (item: ApiContextEntity<ApiVersion.v1>): ContextItem => {
  return {
    id: item.id,
    externalId: item.externalId ?? undefined,
    isActive: item.isActive,
    isDeleted: item.isDeleted,
    created: new Date(item.created),
    source: item.source ?? undefined,
    title: item.title ?? undefined,
    type: parseContextType(item.type),
    // TODO(#5115): parse and map the raw `value` payload into a typed context item value
    value: item.value ?? {},
  };
};
