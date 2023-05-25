import { useCallback, useMemo } from 'react';
import { useHttpClient } from '@equinor/fusion-framework-react-app/http';
import { Query } from '@equinor/fusion-query';
import { useDebounceQuery } from '@equinor/fusion-query/react';
import { PersonSearchResult } from './api-models';
import { PersonSearchResult as P } from './components/PersonSearchResult';

import { useObservableSelectorState } from '@equinor/fusion-observable/react';

type PeopleSearchArgs = {
    search: string;
    filter?: string; //"positions/any(p: p/project/name eq 'Early Phase Projects (pre DG1)' and p/isActive)",
    includeTotalResultCount?: boolean;
    top?: number;
};

export const App = () => {
    const peopleHttpClient = useHttpClient('people');
    const peopleQuery = useMemo(
        () =>
            new Query({
                client: {
                    fn: (args: PeopleSearchArgs) =>
                        peopleHttpClient.json$<PersonSearchResult>('/search/persons/query', {
                            body: JSON.stringify(args),
                            method: 'post',
                        }),
                },
                key: (args) => JSON.stringify(args),
            }),
        [peopleHttpClient]
    );

    const { idle, next, value$ } = useDebounceQuery(peopleQuery, { debounce: 1000 });

    const { value: results } = useObservableSelectorState(
        value$,
        useCallback((x) => x.value.results, [value$])
    );

    return (
        <>
            <h1>🚀 Hello Fusion😎</h1>
            <div>
                <input
                    disabled={!idle}
                    type="search"
                    onChange={(e) => next({ search: e.target.value })}
                />
                {results && results.map((x) => <P key={x.document.azureUniqueId} item={x}></P>)}
            </div>
        </>
    );
};

export default App;
