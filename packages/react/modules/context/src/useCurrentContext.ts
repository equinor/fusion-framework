import type { ContextItem } from '@equinor/fusion-framework-module-context';
import type { IContextProvider } from '@equinor/fusion-framework-module-context';
import { useObservableState } from '@equinor/fusion-observable/react';
import { useCallback, useMemo } from 'react';

export const useCurrentContext = (provider: IContextProvider) => {
  const currentContext$ = useMemo(() => provider.currentContext$, [provider]);
  const { value: currentContext } = useObservableState(currentContext$, {
    initial: provider.currentContext,
  });
  const setCurrentContext = useCallback(
    (entry?: ContextItem | string | null) => {
      if (!entry) {
        return provider.clearCurrentContext();
      } else if (typeof entry === 'string') {
        return provider.setCurrentContextByIdAsync(entry);
      }
      return provider.setCurrentContextAsync(entry);
    },
    [provider],
  );
  return { currentContext, setCurrentContext };
};
