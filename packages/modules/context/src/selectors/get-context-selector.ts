import type { GetContextResponse } from '@equinor/fusion-framework-module-services/context/get';

import { parseContextItem } from '../utils/parse-context-item';
import type { ContextItem } from '../types';

/**
 * Parse the response from the GetContext API into a context item.
 * @param response The response object containing the context item.
 * @returns A promise that resolves to the context item.
 */
export const getContextSelector = async (response: Response): Promise<ContextItem> => {
  const result = (await response.json()) as GetContextResponse<'v1'>;
  return parseContextItem(result);
};
