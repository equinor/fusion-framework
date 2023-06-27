import { useCallback, useEffect, useMemo, useState } from 'react';
import { useFramework } from '@equinor/fusion-framework-react';
import { useCurrentApp } from '@equinor/fusion-framework-react/app';
import type { AppModule } from '@equinor/fusion-framework-module-app';
import type { NavigationModule } from '@equinor/fusion-framework-module-navigation';
import { ContextItem, ContextModule, IContextProvider } from '@equinor/fusion-framework-module-context';
import { useObservableState, useObservableSubscription } from '@equinor/fusion-observable/react';
import '@equinor/fusion-framework-app';

import { EMPTY, catchError, lastValueFrom, map , of } from 'rxjs';

import { ContextResult, ContextResultItem, ContextResolver } from '@equinor/fusion-react-context-selector';
import { AppModulesInstance } from '@equinor/fusion-framework-app';

/**
 * Map context query result to ContextSelectorResult.
 * Add any icons to selected types by using the 'graphic' property
 * @param src context query result
 * @returns src mapped to ContextResult type
 */
const mapper = (src: Array<ContextItem>): ContextResult => {
  return src.map((i) => {
    return {
      id: i.id,
      title: i.title,
      subTitle: i.type.id,
      graphic: i.type.id === 'OrgChart' ? 'list' : undefined,
    };
  });
};

/**
 * Create a single ContextResultItem
 * @param props pops for the item to merge with defaults
 * @returns ContextResultItem
 */
const singleItem = (props: Partial<ContextResultItem>): ContextResultItem => {
  return Object.assign({ id: 'no-such-item', title: 'Change me' }, props);
};

/**
 * Hook for querying context and setting resolver for ContextSelector component
 * See React Components storybook for info about ContextSelector component and its resolver
 * @link https://equinor.github.io/fusion-react-components/?path=/docs/data-contextselector--component
 * @return Array<ContextResolver, SetContextCallback>
 */
export const useContextResolver = (): { resolver: ContextResolver | null; provider: IContextProvider | null; currentContext: ContextResult } => {
  /* Framework modules */
  const framework = useFramework<[AppModule, NavigationModule]>();

  const { currentApp } = useCurrentApp();
  
  /** App module collection instance */
  const instance$ = useMemo(() => currentApp?.instance$ || EMPTY, [currentApp]);

  /* context provider state */
  const [provider, setProvider] = useState<IContextProvider | null>(null);

  /* Current context observable */
  const { value: currentContext } = useObservableState(useMemo(() => provider?.currentContext$ || EMPTY, [provider]));

  // const {next: currentApp} = useObservableState(useMemo(() => framework.modules.app.current$, [framework]));

  const preselected: ContextResult = useMemo(() => {
    return currentContext ? mapper([currentContext]) : [];
  }, [currentContext]);

  

  /** callback function when current app instance changes */
  const onContextProviderChange = useCallback(
    (modules: AppModulesInstance) => {
      /** try to get the context module from the app module instance */
      const contextProvider = (modules as AppModulesInstance<[ContextModule]>).context;
      if (contextProvider) {
        setProvider(contextProvider);
      } else {
        setProvider(null);
      }
    },
    [setProvider]
  );

  /** clear the app provider */
  const clearContextProvider = useCallback(() => {
    setProvider(null);
  }, [setProvider]);

  // TODO: change to use a common event when a context module is registered

  /** observe changes to app modules and  clear / set the context provider on change */
  useObservableSubscription(instance$, onContextProviderChange, clearContextProvider);
  useEffect(() => framework.modules.event.addEventListener('onReactAppLoaded', e => {
    console.debug('useContextResolver::onReactAppLoaded', 'using legacy register hack method');
    return onContextProviderChange(e.detail.modules);
  }), [framework]);

  /**
   * set resolver for ContextSelector
   * @return ContextResolver
   */
  const minLength = 2;
  const resolver = useMemo(
    (): ContextResolver | null =>
      provider && {
        searchQuery: async (search: string): Promise<ContextResult> => {
          if (search.length < minLength) {
            return [
              singleItem({
                 // TODO - make as enum if used for checks, or type
                id: 'min-length',
                title: `Type ${minLength - search.length} more chars to search`,
                isDisabled: true,
              }),
            ];
          }
          try {
            return lastValueFrom(provider.queryContext(search).pipe(
              map(mapper), 
              map(x => x.length ? x : [
                singleItem({
                  // TODO - make as enum if used for checks, or type
                  id: 'no-results',
                  title: 'No results found',
                  isDisabled: true,
                }),
              ]),
              /** handle failures */
              catchError(err => {
                console.error('PORTAL::ContextResolver', `failed to resolve context for query ${search}`, err.cause);
                // TODO - create an item which shows that the context resolver failed to execute query
                return of([] as ContextResult); 
              })
            ));
          /** this should NEVER happen! */
          } catch (err) {
            console.error('PORTAL::ContextResolver', `unhandled error for [${search}]`, err);
            return [];
          }
          
        },
        initialResult: preselected,
      },
    [provider, preselected]
  );
  return { resolver, provider, currentContext: preselected };
};

export default useContextResolver;
