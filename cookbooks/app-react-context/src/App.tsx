import { ChangeEvent, StrictMode, useCallback } from 'react';

import {
    useModuleCurrentContext,
    useModuleQueryContext,
} from '@equinor/fusion-framework-react-module-context';

export const App = () => {
    const { currentContext, setCurrentContext } = useModuleCurrentContext();

    const { query, querying, value: searchResult } = useModuleQueryContext();

    const onInputChange = useCallback(
        (e: ChangeEvent<HTMLInputElement>) => {
            query(e.currentTarget.value);
        },
        [query]
    );

    const onSelectChange = useCallback(
        (e: ChangeEvent<HTMLSelectElement>) => {
            setCurrentContext(e.currentTarget.value);
        },
        [query]
    );

    return (
        <StrictMode>
            <h1>React Context App</h1>
            <input type="search" onChange={onInputChange} />
            <br />
            <select onChange={onSelectChange} disabled={querying}>
                {searchResult &&
                    searchResult.map((x) => (
                        <option value={x.id} key={x.id}>
                            {x.title}
                        </option>
                    ))}
            </select>
            <pre>{JSON.stringify(currentContext, null, 2)}</pre>
        </StrictMode>
    );
};

export default App;
