import type { RelatedContextResponse } from '@equinor/fusion-framework-module-services/context/related';

import { parseContextItem } from '../utils/parse-context-item';
import type { ContextItem } from '../types';

/**
 * Parse the response from the RelatedContext API into an array of context items.
 * @param response The response object containing the related context items.
 * @returns A promise that resolves to an array of ContextItem objects.
 */
export const relatedContextSelector = async (response: Response): Promise<ContextItem[]> => {
  const result = (await response.json()) as RelatedContextResponse<'v1'>;
  // parse each raw API entry into a ContextItem
  return result.map(parseContextItem);
};
