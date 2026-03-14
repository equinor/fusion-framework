import { useCallback, useEffect, useMemo, useState } from 'react';
import { useFramework } from '@equinor/fusion-framework-react';
import { useCurrentApp } from '@equinor/fusion-framework-react/app';
import type { AppModule } from '@equinor/fusion-framework-module-app';
import type { NavigationModule } from '@equinor/fusion-framework-module-navigation';
import type {
  ContextItem,
  ContextModule,
  IContextProvider,
} from '@equinor/fusion-framework-module-context';
import { useObservableState, useObservableSubscription } from '@equinor/fusion-observable/react';
import '@equinor/fusion-framework-app';
import { ChipElement } from '@equinor/fusion-wc-chip';
ChipElement;

import { EMPTY, catchError, lastValueFrom, map, of } from 'rxjs';

import type {
  ContextResult,
  ContextResultItem,
  ContextResolver,
} from '@equinor/fusion-react-context-selector';
import type { AppModulesInstance } from '@equinor/fusion-framework-app';
import type { QueryClientError } from '@equinor/fusion-query/client';
import type { FusionContextSearchError } from '@equinor/fusion-framework-module-context/errors.js';

/**
 * Capitalizes the first letter of a string and lowercases the rest.
 *
 * @param string - The input string to capitalize.
 * @returns The capitalized string.
 */
function capitalizeFirstLetter(string: string): string {
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

/**
 * Converts a {@link ContextItem} graphic field to the shape expected by `ContextResultItem`.
 *
 * @param graphic - The graphic value from a context item (string, SVG object, or undefined).
 * @returns An object with `graphic` and `graphicType` properties, or an empty object.
 */
function convertGraphic(
  graphic: ContextItem['graphic'],
): Pick<ContextResultItem, 'graphic' | 'graphicType'> {
  if (graphic === undefined) {
    return {};
  }

  if (typeof graphic === 'string') {
    return {
      graphicType: graphic.startsWith('<')
        ? 'inline-html'
        : ('eds' as unknown as ContextResultItem['graphicType']),
      graphic: graphic,
    };
  }

  if (graphic.type === 'svg') {
    return {
      graphicType: 'inline-svg',
      graphic: graphic.content,
    };
  }

  return {
    graphicType: 'inline-html',
    graphic: graphic.content,
  };
}

/**
 * Converts a {@link ContextItem} meta field to the shape expected by `ContextResultItem`.
 *
 * @param meta - The meta value from a context item (string, SVG object, or undefined).
 * @returns An object with `meta` and `metaType` properties, or an empty object.
 */
function convertMeta(meta: ContextItem['meta']): Pick<ContextResultItem, 'metaType' | 'meta'> {
  if (meta === undefined) {
    return {};
  }

  if (typeof meta === 'string') {
    return {
      metaType: meta.startsWith('<')
        ? 'inline-html'
        : ('eds' as unknown as ContextResultItem['metaType']),
      meta: meta,
    };
  }

  if (meta.type === 'svg') {
    return {
      metaType: 'inline-svg',
      meta: meta.content,
    };
  }

  return {
    metaType: 'inline-html',
    meta: meta.content,
  };
}

/**
 * Maps an array of context items to `ContextResult` for the context selector dropdown.
 *
 * Applies custom rendering for `EquinorTask` (shows inactive state chip) and
 * `OrgChart` (shows list icon and inactive state chip) context types.
 *
 * @param src - Array of context items from the context query.
 * @returns Mapped array of `ContextResultItem` objects for the selector UI.
 */
const mapper = (src: ContextItem<{ taskState?: string; state?: string }>[]): ContextResult => {
  return src.map((i) => {
    const baseResult = {
      id: i.id,
      title: i.title,
      subTitle: i.subTitle ?? i.type.id,
      ...convertGraphic(i.graphic),
      ...convertMeta(i.meta),
    };

    // Displays the status of the EquinorTask if it is not 'active'
    const isEquinorTaskInactive = !!(
      i.value.taskState && i.value.taskState.toLowerCase() !== 'active'
    );
    if (i.type.id === 'EquinorTask' && isEquinorTaskInactive) {
      baseResult.meta = `<fwc-chip disabled variant="outlined" value="${i.value.taskState}" />`;
      baseResult.metaType = 'inline-html';
    }

    if (i.type.id === 'OrgChart') {
      // Org charts should always have 'list' icon
      baseResult.graphic = 'list';
      baseResult.graphicType = 'eds' as unknown as ContextResultItem['graphicType'];

      // Displays the org chart status if it is not 'active'
      const isOrgChartInactive = !!(i.value.state && i.value.state.toLowerCase() !== 'active');
      if (isOrgChartInactive) {
        baseResult.meta = `<fwc-chip disabled variant="outlined" value="${capitalizeFirstLetter(i.value.state ?? '')}" />`;
        baseResult.metaType = 'inline-html';
      }
    }

    return baseResult;
  });
};

/**
 * Creates a single `ContextResultItem` with sensible defaults.
 *
 * Used to generate placeholder or error entries in the context selector dropdown.
 *
 * @param props - Partial properties to merge into the default item shape.
 * @returns A complete `ContextResultItem` with defaults for `id` and `title`.
 */
const singleItem = (props: Partial<ContextResultItem>): ContextResultItem => {
  return Object.assign({ id: 'no-such-item', title: 'Change me' }, props);
};

/**
 * Hook that creates a context resolver, tracks the current context provider,
 * and provides the currently selected context for the {@link ContextSelector}.
 *
 * Observes the current application's module instances. When the app exposes a
 * context module, the hook wires up a search resolver that queries context items
 * and maps results to `ContextResultItem`. It also handles error display and
 * minimum query length enforcement.
 *
 * @see {@link https://equinor.github.io/fusion-react-components/?path=/docs/data-contextselector--component | ContextSelector Storybook}
 * @returns An object containing the `resolver` for the selector, the current `provider`, and `currentContext` items.
 */
export const useContextResolver = (): {
  resolver: ContextResolver | null;
  provider: IContextProvider | null;
  currentContext: ContextResult;
} => {
  /* Framework modules */
  const framework = useFramework<[AppModule, NavigationModule]>();

  const { currentApp } = useCurrentApp();

  /** App module collection instance */
  const instance$ = useMemo(() => currentApp?.instance$ || EMPTY, [currentApp]);

  /* context provider state */
  const [provider, setProvider] = useState<IContextProvider | null>(null);

  /* Current context observable */
  const { value: currentContext } = useObservableState(
    useMemo(() => provider?.currentContext$ || EMPTY, [provider]),
  );

  const preselected: ContextResult = useMemo(() => {
    return currentContext ? mapper([currentContext]) : [];
  }, [currentContext]);

  /** callback function when current app instance changes */
  const onContextProviderChange = useCallback((modules: AppModulesInstance) => {
    /** try to get the context module from the app module instance */
    const contextProvider = (modules as AppModulesInstance<[ContextModule]>).context;
    if (contextProvider) {
      setProvider(contextProvider);
    } else {
      setProvider(null);
    }
  }, []);

  /** clear the app provider */
  const clearContextProvider = useCallback(() => {
    setProvider(null);
  }, []);

  /** observe changes to app modules and  clear / set the context provider on change */
  useObservableSubscription(instance$, onContextProviderChange, clearContextProvider);
  useEffect(
    () =>
      framework.modules.event.addEventListener('onReactAppLoaded', (e) => {
        console.debug('useContextResolver::onReactAppLoaded', 'using legacy register hack method');
        return onContextProviderChange(e.detail.modules);
      }),
    [framework, onContextProviderChange],
  );

  const processError = useCallback((err: Error): ContextResult => {
    if (err.name === 'QueryClientError') {
      return processError((err as QueryClientError).cause as Error);
    }

    if (err.name === 'FusionContextSearchError') {
      const error = err as FusionContextSearchError;
      return [
        singleItem({
          id: error.name,
          title: error.title,
          subTitle: error.description,
          graphic: 'error_outlined',
          isDisabled: true,
        }),
      ];
    }

    return [
      singleItem({
        title: 'Unexpected error occurred',
        subTitle: 'Please try again or report the issue in Services@Equinor',
        graphic: 'error_outlined',
        isDisabled: true,
      }),
    ];
  }, []);

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
            return lastValueFrom(
              provider.queryContext(search).pipe(
                map(mapper),
                map((x) =>
                  x.length
                    ? x
                    : [
                        singleItem({
                          // TODO - make as enum if used for checks, or type
                          id: 'no-results',
                          title: 'No results found',
                          graphic: 'info_circle',
                          isDisabled: true,
                        }),
                      ],
                ),
                /** handle failures */
                catchError((err) => {
                  console.error(
                    'PORTAL::ContextResolver',
                    `failed to resolve context for query ${search}`,
                    err,
                    err.cause,
                  );

                  return of(processError(err));
                }),
              ),
            );
            /** this should NEVER happen! */
          } catch (e) {
            const err = e as Error;
            console.error('PORTAL::ContextResolver', `unhandled error for [${search}]`, e);
            return processError(err);
          }
        },
        initialResult: preselected,
      },
    [provider, preselected, processError],
  );
  return { resolver, provider, currentContext: preselected };
};

export default useContextResolver;
