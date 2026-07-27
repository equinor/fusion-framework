import type { ContextItem } from '@equinor/fusion-framework-module-context';
import type { IContextProvider } from '@equinor/fusion-framework-module-context';
import { useObservableState } from '@equinor/fusion-observable/react';
import { useCallback, useMemo } from 'react';

/**
 * Hook for observing and updating the framework's current context.
 *
 * @param provider - The context provider to observe and update
 * @returns The current context and a setter that clears, sets by id, or sets it directly
 */
export const useCurrentContext = (provider: IContextProvider) => {
  const currentContext$ = useMemo(() => provider.currentContext$, [provider]);
  const { value: currentContext } = useObservableState(currentContext$, {
    initial: provider.currentContext,
  });
  const setCurrentContext = useCallback(
    (entry?: ContextItem | string | null) => {
      // Clear the current context when no entry is provided
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
