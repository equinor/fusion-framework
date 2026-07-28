import type { QueryContextResponse } from '@equinor/fusion-framework-module-services/context/query';

import { parseContextItem } from './parse-context-item';
import type { ContextItem } from './types';

/**
 * Parse the response from the QueryContext API into an array of context items.
 * @param response The response object.
 * @returns A promise that resolves to an array of context items.
 */
export const queryContextSelector = async (response: Response): Promise<ContextItem[]> => {
  const result = (await response.json()) as QueryContextResponse<'v1'>;
  // parse each raw API entry into a ContextItem
  return result.map(parseContextItem);
};
