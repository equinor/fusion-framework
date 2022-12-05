import { useCallback, useEffect, useMemo, useState } from 'react';
import { useFramework } from '@equinor/fusion-framework-react';
import { ContextItem, IContextProvider } from '@equinor/fusion-framework-module-context';
import { useObservableState } from '@equinor/fusion-observable/react';
import '@equinor/fusion-framework-app';

import {
    ContextSelector as ContextSelectorComponent,
    ContextResult,
    ContextResultItem,
    ContextResolver,
    ContextSelectEvent,
} from '@equinor/fusion-react-context-selector';

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
const useQueryContext = (): [ContextResolver, (e: ContextSelectEvent) => void] => {
    /* Framework modules */
    const framework = useFramework();

    /* Current context observable */
    const currentContext = useObservableState(framework.modules.context.currentContext$);

    /* Set currentContext as initialResult in dropdown  */
    let preselected: ContextResult = [];
    if (currentContext) {
        preselected = mapper([currentContext]);
    }

    /* context provider state */
    const [provider, setProvider] = useState<IContextProvider>();

    /**
     * Set context provider state if this app triggered the event.
     * and only if the app has a context
     * */
    useEffect(() => {
        return framework.modules.event.addEventListener('onAppModulesLoaded', (e) => {
            if (e.detail?.env.manifest?.key === framework.modules.app.current?.key) {
                if (e.detail.modules.context) {
                    setProvider(e.detail.modules.context);
                }
            }
        });
    }, [framework]);

    /**
     * set resolver for ContextSelector
     * @return ContextResolver
     */
    const resolver = useMemo(
        (): ContextResolver => ({
            searchQuery: async (search: string) => {
                if (!provider) {
                    return [];
                }
                const minLength = 3;
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
                            isDisabled: true,
                        }),
                    ];
                } catch (e) {
                    console.log('ContextResolver query was cancelled');
                    return [];
                }
            },
            initialResult: preselected,
        }),
        [provider, preselected]
    );

    /* Callback for setting current context to selected item id. */
    const setContext = useCallback(
        (e: ContextSelectEvent): void => {
            if (e.nativeEvent.detail?.selected.length) {
                framework.modules.context.contextClient.setCurrentContext(
                    e.nativeEvent.detail.selected[0].id
                );
            }
        },
        [framework]
    );

    return [resolver, setContext];
};

/**
 * Variants available. See component storybook for available attributes
 * @link https://equinor.github.io/fusion-react-components/?path=/docs/data-contextselector--component
 * @returns JSX element
 */
export const ContextSelector = () => {
    const [resolver, setContext] = useQueryContext();
    return (
        <ContextSelectorComponent
            id="context-selector-header"
            placeholder="Search for context"
            initialText="Start typing to search"
            dropdownHeight="300px"
            variant="header"
            resolver={resolver}
            onSelect={setContext}
        />
    );
};

export default ContextSelector;
