import { useCallback, useEffect, useMemo, useState } from 'react';
import { useFramework } from '@equinor/fusion-framework-react';
import { useCurrentApp } from '@equinor/fusion-framework-react/app';
import type { AppModule } from '@equinor/fusion-framework-module-app';
import type { NavigationModule } from '@equinor/fusion-framework-module-navigation';
import {
    ContextItem,
    ContextModule,
    IContextProvider,
} from '@equinor/fusion-framework-module-context';
import { useObservableState, useObservableSubscription } from '@equinor/fusion-observable/react';
import '@equinor/fusion-framework-app';
import { ChipElement } from '@equinor/fusion-wc-chip';
ChipElement;

import { EMPTY, catchError, lastValueFrom, map, of } from 'rxjs';

import {
    ContextResult,
    ContextResultItem,
    ContextResolver,
} from '@equinor/fusion-react-context-selector';
import { AppModulesInstance } from '@equinor/fusion-framework-app';
import { QueryClientError } from '@equinor/fusion-query/client';
import { FusionContextSearchError } from '@equinor/fusion-framework-module-context/errors';

function capitalizeFirstLetter(string: string): string {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

/**
 * Map context query result to ContextSelectorResult.
 * Add any icons to selected types by using the 'graphic' property
 * @param src context query result
 * @returns src mapped to ContextResult type
 */
const mapper = (src: Array<ContextItem>): ContextResult => {
    return src.map((i) => {
        const baseResult = {
            id: i.id,
            title: i.title,
            subTitle: i.subTitle ?? i.type.id,
            graphic: i.graphic,
            meta: i.meta,
        };

        switch (i.type.id) {
            case 'EquinorTask':
                return {
                    ...baseResult,
                    meta:
                        i.value.taskState && i.value.taskState !== 'Active'
                            ? `<fwc-chip disabled variant="outlined" value="${i.value.taskState}" />`
                            : '',
                };
            case 'OrgChart':
                return {
                    ...baseResult,
                    graphic: 'list',
                    meta:
                        i.value.state && (i.value.state as string).toLowerCase() !== 'active'
                            ? `<fwc-chip disabled variant="outlined" value="${capitalizeFirstLetter(i.value.state as string)}" />`
                            : '',
                };
            default:
                return baseResult;
        }
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
        [setProvider],
    );

    /** clear the app provider */
    const clearContextProvider = useCallback(() => {
        setProvider(null);
    }, [setProvider]);

    /** observe changes to app modules and  clear / set the context provider on change */
    useObservableSubscription(instance$, onContextProviderChange, clearContextProvider);
    useEffect(
        () =>
            framework.modules.event.addEventListener('onReactAppLoaded', (e) => {
                console.debug(
                    'useContextResolver::onReactAppLoaded',
                    'using legacy register hack method',
                );
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
                        console.error(
                            'PORTAL::ContextResolver',
                            `unhandled error for [${search}]`,
                            e,
                        );
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
