import { useEffect, useMemo, useState } from 'react';
import { useFramework } from '@equinor/fusion-framework-react';
import { ContextItem, IContextProvider } from '@equinor/fusion-framework-module-context';
import '@equinor/fusion-framework-app';

import {
    ContextSelector as ContextSelectorComponent,
    ContextResult,
    ContextResultItem,
    ContextResolver,
} from '@equinor/fusion-react-context-selector';

const mapper = (src: ContextItem<Record<string, unknown>>[]): ContextResult => {
    const dst = src.map((i) => {
        return {
            id: i.id,
            title: i.title,
            subTitle: i.type.id,
            graphic: i.type.id === 'OrgChart' ? 'list' : undefined,
        };
    });

    return dst;
};

const singleItem = (props: Partial<ContextResultItem>): ContextResultItem => {
    return Object.assign({ id: 'no-such-item', title: 'Change me' }, props);
};

const useQueryContext = (): ContextResolver => {
    const framework = useFramework();
    const [provider, setProvider] = useState<IContextProvider | undefined>();
    useEffect(() => {
        return framework.modules.event.addEventListener('onAppModulesLoaded', (e) => {
            if (e.detail) {
                if (e.detail.env.manifest?.key === framework.modules.app.current?.key) {
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    /* @ts-ignore */
                    setProvider(e.detail.modules.context);
                }
            }
        });
    }, [framework]);

    const resolver = useMemo(
        () => ({
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
                    console.error('ContextResolver:', e);
                }
            },
            initialResult: [
                {
                    id: '0',
                    title: 'InitialResults',
                    subTitle: 'Favourites or readily available contexts',
                    isDisabled: true,
                },
                {
                    id: '1',
                    title: 'Another initial result',
                    subTitle: 'Favourites or readily available contexts',
                    isDisabled: true,
                },
            ],
        }),
        [provider]
    );

    return resolver as ContextResolver;
};

export const ContextSelector = () => {
    const resolver = useQueryContext();

    return (
        <ContextSelectorComponent
            id="context-selector-header"
            label="Context Selector"
            placeholder="Search for context..."
            initialText="Start typing to search..."
            dropdownHeight="300px"
            variant="header"
            resolver={resolver}
            onSelect={(e) => console.log(e)}
        />
    );
};

export default ContextSelector;
