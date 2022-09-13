import { Suspense } from 'react';

import { createComponent, useAppModules } from '@equinor/fusion-framework-react-app';
import { useAppConfig } from '@equinor/fusion-framework-react-app/config';
import { useFramework, useCurrentUser } from '@equinor/fusion-framework-react-app/framework';
import { AppList } from 'AppList';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { StarProgress } from '@equinor/fusion-react-progress-indicator';

import { enableAgGrid } from '@equinor/fusion-framework-module-ag-grid';

interface App {
    key: string;
    name: string;
}

const queryClient = new QueryClient();

export const AppComponent = (): JSX.Element => {
    const framework = useFramework();
    const modules = useAppModules();
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
                <AppList />
            </QueryClientProvider>
        </div>
    );
};

export const creator = createComponent(AppComponent, async (config, { fusion }) => {
    config.logger.level = 4;
    enableAgGrid(config);
    await config.useFrameworkServiceClient(fusion, 'portal');
});

export const App = () => {
    const fusion = useFramework();
    const Component = creator({ fusion, env: { name: 'test-app' } });
    return (
        <Suspense fallback={<StarProgress text="Loading Application" />}>
            <Component />
        </Suspense>
    );
};

export default App;
