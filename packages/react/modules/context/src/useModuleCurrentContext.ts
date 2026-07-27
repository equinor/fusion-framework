import type { ContextModule } from '@equinor/fusion-framework-module-context';
import { contextModuleKey } from '@equinor/fusion-framework-module-context';
import { useModule } from '@equinor/fusion-framework-react-module';

import { useCurrentContext } from './useCurrentContext.js';

/**
 * uses context provider from closes module provider
 */
export const useModuleCurrentContext = () => {
  const provider = useModule<ContextModule>(contextModuleKey);
  return useCurrentContext(provider);
};

export default useModuleCurrentContext;
