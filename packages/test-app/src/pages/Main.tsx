import { useEffect } from 'react';

import { Service, ServicesModule } from '@equinor/fusion-framework-module-services';
import { useAppModules } from '@equinor/fusion-framework-react-app';
import { useAppConfig } from '@equinor/fusion-framework-react-app/config';
import { useCurrentUser, useFramework } from '@equinor/fusion-framework-react-app/framework';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
// import { StarProgress } from '@equinor/fusion-react-progress-indicator';

const queryClient = new QueryClient();

export const Main = (): JSX.Element => {
    const framework = useFramework();
    const modules = useAppModules<[ServicesModule]>();

    useEffect(() => {
        modules.services.createApiClient(Service.Context, 'fetch$').then((x) => {
            x.get(x.Version.v1, { id: '29c865ad-1178-4dfd-9e8b-ed5440473da3' }).subscribe((res) =>
                res.json().then(console.log)
            );
        });
    }, []);

    const account = useCurrentUser();
    const { data: configs } = useAppConfig({ appKey: 'contract-personnel' });
    return (
        <div>
            <h3>Current user</h3>
            <code>
                <pre>{JSON.stringify(account, null, 4)}</pre>
            </code>
            <h3>Registered modules in Framework</h3>
            <ul>
                {Object.keys(framework.modules).map((x) => (
                    <li key={x}>{x}</li>
                ))}
            </ul>
            <h3>App Config</h3>
            <code>
                <pre>{JSON.stringify(configs, null, 4)}</pre>
            </code>
            <h3>Registered modules in App</h3>
            <ul>
                {Object.keys(modules).map((x) => (
                    <li key={x}>{x}</li>
                ))}
            </ul>
            <QueryClientProvider client={queryClient}>
                <ReactQueryDevtools initialIsOpen />
                {/* <AppList /> */}
            </QueryClientProvider>
        </div>
    );
};
