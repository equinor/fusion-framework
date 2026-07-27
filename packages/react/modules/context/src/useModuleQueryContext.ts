import type { ContextModule } from '@equinor/fusion-framework-module-context';
import { contextModuleKey } from '@equinor/fusion-framework-module-context';
import { useModule } from '@equinor/fusion-framework-react-module';

import { useQueryContext } from './useQueryContext.js';

export const useModuleQueryContext = (options?: { debounce?: number }) => {
  const provider = useModule<ContextModule>(contextModuleKey);
  return useQueryContext(provider, options);
};
