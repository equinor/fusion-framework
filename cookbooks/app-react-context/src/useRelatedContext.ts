import { useMemo } from 'react';
import { EMPTY } from 'rxjs';

import {
  type ContextItem,
  type ContextModule,
  useModuleCurrentContext,
} from '@equinor/fusion-framework-react-module-context';
import { useAppModule } from '@equinor/fusion-framework-react-app';
import { useObservableState } from '@equinor/fusion-observable/react';

/**
 * DO NOT COPY
 * will create util functions for related context
 * @param type - Optional context item types used to filter related results.
 * @returns Observable state containing related context items.
 */
export const useRelatedContext = (
  type?: string[],
): ReturnType<typeof useObservableState<ContextItem[] | undefined>> => {
  const { currentContext } = useModuleCurrentContext();
  const provider = useAppModule<ContextModule>('context');
  return useObservableState(
    // biome-ignore lint/correctness/useExhaustiveDependencies: changing type should not trigger rerender
    useMemo(() => {
      // Avoid querying related context until a current context item exists.
      if (!currentContext) return EMPTY;
      return provider.relatedContexts({
        item: currentContext,
        filter: { type },
      });
    }, [provider, currentContext]),
  );
};

export default useRelatedContext;
