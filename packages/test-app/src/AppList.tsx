import { useMemo } from 'react';
import { useQuery } from 'react-query';

import {
    useHttpClient,
    IHttpClient,
    FetchRequestInit,
} from '@equinor/fusion-framework-react-app/http';

interface App {
    key: string;
    name: string;
}

const selector = (x: Response): Promise<App[]> => {
    return x.json();
};

const useAllApps = () => {
    const client = useHttpClient('portal');
    const fn = useMemo(() => getAllApps(client), [client]);
    return useQuery('all_apps', ({ signal }) => fn({ signal, selector }));
    //     client.fetchAsync('api/apps', { selector, signal })
    // );
};

const getAllApps =
    (client: IHttpClient) =>
    (init: FetchRequestInit): Promise<App[]> => {
        return client.fetchAsync('api/apps', { ...init, selector });
    };

export const AppList = () => {
    const { data, isLoading } = useAllApps();
    if (isLoading) {
        return <span>Loading apps.....</span>;
    }

    return (
        <div>
            <h3>List of registered apps in fusion</h3>
            <code>
                <pre>{JSON.stringify(data, null, 4)}</pre>
            </code>
        </div>
    );
};
