import { useCallback, useMemo, useState } from 'react';
import { useFramework } from '@equinor/fusion-framework-react';
import { useCurrentApp } from '@equinor/fusion-framework-react/app';
import { FusionContextSearchError } from '@equinor/fusion-framework-module-context/errors';
import {
    ContextItem,
    ContextModule,
    IContextProvider,
} from '@equinor/fusion-framework-module-context';
import { useObservableState, useObservableSubscription } from '@equinor/fusion-observable/react';

import { EMPTY } from 'rxjs';

import {
    ContextProvider,
    ContextSearch,
    ContextResult,
    ContextResultItem,
    ContextResolver,
    ContextSelectEvent,
} from '@equinor/fusion-react-context-selector';

import type { AppModulesInstance } from '@equinor/fusion-framework-app';
import { styled } from 'styled-components';
import { QueryClientError } from '@equinor/fusion-query/src/client';

const Styled = {
    ContextSelectorWrapper: styled.div`
        min-width: 25rem;
        width: fit-content;
    `,
};

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
            subTitle: i.type?.id,
            graphic: i.type?.id === 'OrgChart' ? 'list' : undefined,
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

const noPreselect: ContextResult = [];

const processError = (err: Error): ContextResult => {
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
};

/**
 * Hook for querying context and setting resolver for ContextSelector component
 * See React Components storybook for info about ContextSelector component and its resolver
 * @link https://equinor.github.io/fusion-react-components/?path=/docs/data-contextselector--component
 * @return Array<ContextResolver, SetContextCallback>
 */
const useQueryContext = (): [
    ContextResolver,
    (e: ContextSelectEvent) => void,
    ContextResultItem,
    () => void,
] => {
    /* Framework modules */
    const framework = useFramework();

    // TODO change to `useCurrentContext`
    /* Current context observable */
    const { value: currentContext } = useObservableState(
        useMemo(() => framework.modules.context.currentContext$, [framework.modules.context]),
    );

    /* Set currentContext as initialResult in dropdown  */
    const preselected: ContextResult = useMemo(
        () => (currentContext ? mapper([currentContext]) : noPreselect),
        [currentContext],
    );

    /* context provider state */
    const [provider, setProvider] = useState<IContextProvider | null>(null);

    const { currentApp } = useCurrentApp();

    /** App module collection instance */
    const instance$ = useMemo(() => currentApp?.instance$ || EMPTY, [currentApp]);

    /** callback function when current app instance changes */
    const onContextProviderChange = useCallback(
        (modules: AppModulesInstance) => {
            /** try to get the context module from the app module instance */
            const contextProvider = (modules as AppModulesInstance<[ContextModule]>).context;
            if (contextProvider) {
                setProvider(contextProvider);
            }
        },
        [setProvider],
    );

    /** clear the app provider */
    const clearContextProvider = useCallback(() => setProvider(null), [setProvider]);

    /** observe changes to app modules and  clear / set the context provider on change */
    useObservableSubscription(instance$, onContextProviderChange, clearContextProvider);

    /**
     * Set context provider state if this app triggered the event.
     * and only if the app has a context
     * */

    /**
     * set resolver for ContextSelector
     * @return ContextResolver
     */
    const minLength = 3;
    const resolver = useMemo(
        (): ContextResolver => ({
            searchQuery: async (search: string) => {
                if (!provider) {
                    return [];
                }
                if (search.length < minLength) {
                    return [
                        singleItem({
                            id: 'min-length',
                            title: `Type ${minLength - search.length} more chars to search`,
                            isDisabled: true,
                        }),
                    ];
                }
                try {
                    const result = await provider.queryContextAsync(search);
                    if (result.length) {
                        return mapper(result);
                    }
                    return [
                        singleItem({
                            id: 'no-results',
                            title: 'No results found',
                            graphic: 'info_circle',
                            isDisabled: true,
                        }),
                    ];
                } catch (e) {
                    const err = e as Error;
                    console.log('ContextResolver query was cancelled');
                    return processError(err);
                }
            },
            initialResult: preselected,
        }),
        [provider, preselected],
    );

    /* Callback for setting current context to selected item id. */
    const setContext = useCallback(
        (e: ContextSelectEvent): void => {
            if (e.nativeEvent.detail?.selected.length) {
                framework.modules.context.setCurrentContextByIdAsync(
                    e.nativeEvent.detail.selected[0].id,
                );
            }
        },
        [framework],
    );

    /* Clear current context */
    const clearContext = useCallback(() => {
        if (!framework) return;
        framework.modules.context.clearCurrentContext();
    }, [framework]);

    return [resolver, setContext, preselected?.[0], clearContext];
};

/**
 * Variants available. See component storybook for available attributes
 * @link https://equinor.github.io/fusion-react-components/?path=/docs/data-contextselector--component
 * @returns JSX element
 */
export const ContextSelector = () => {
    const [resolver, setContext, currentContext, clearContext] = useQueryContext();
    return (
        <ContextProvider resolver={resolver}>
            <Styled.ContextSelectorWrapper>
                <ContextSearch
                    id="context-selector-header"
                    placeholder="Search for context"
                    initialText="Start typing to search"
                    dropdownHeight="300px"
                    variant="header"
                    onSelect={setContext}
                    autofocus={true}
                    onClearContext={clearContext}
                    previewItem={currentContext ?? null}
                    value={currentContext?.title}
                    selectedId={currentContext?.title}
                />
            </Styled.ContextSelectorWrapper>
        </ContextProvider>
    );
};

export default ContextSelector;
