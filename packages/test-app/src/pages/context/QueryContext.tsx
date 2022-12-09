import { useModuleQueryContext } from '@equinor/fusion-framework-react-module-context';

export const QueryContext = () => {
    const { query, querying, value } = useModuleQueryContext({ debounce: 1000 });
    return (
        <div>
            <input type="search" onChange={(e) => query(e.currentTarget.value)} />
            <span>{querying ? 'working' : 'idle'}</span>
            <div>
                <pre>{JSON.stringify(value || {}, undefined, 4)}</pre>
            </div>
        </div>
    );
};

export default QueryContext;
