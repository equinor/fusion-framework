import type { ContextModule } from '@equinor/fusion-framework-module-context';
import { contextModuleKey } from '@equinor/fusion-framework-module-context';
import { useModule } from '@equinor/fusion-framework-react-module';

import { useQueryContext } from './useQueryContext.js';

/**
 * Hook for querying the context module's context items, resolving the provider from the
 * framework automatically.
 *
 * @param options - Optional query options, such as a debounce delay in milliseconds
 * @returns The current query result, whether a query is in progress, and a function to trigger a new query
 */
export const useModuleQueryContext = (options?: { debounce?: number }) => {
  const provider = useModule<ContextModule>(contextModuleKey);
  return useQueryContext(provider, options);
};
