import { Suspense } from 'react';

import createApp, { AppConfigurator, useAppModules } from '@equinor/fusion-framework-react-app';
import { useAppConfig } from '@equinor/fusion-framework-react-app/config';
import { useFramework, useCurrentUser } from '@equinor/fusion-framework-react-app/framework';
import { AppList } from 'AppList';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { StarProgress } from '@equinor/fusion-react-progress-indicator';

import moduleAgrGrid, { AgGridModule } from '@equinor/fusion-framework-module-ag-grid';

interface App {
    key: string;
    name: string;
}

const configCallback: AppConfigurator<[AgGridModule]> = async (appModuleConfig, frameworkApi) => {
    console.debug(0, 'configuring app', frameworkApi, appModuleConfig);

    frameworkApi.modules.serviceDiscovery.configureClient(appModuleConfig, 'portal');
    // await frameworkApi.modules.serviceDiscovery.configureClient('portal', appModuleConfig);
    await new Promise((resolve) => setTimeout(resolve, 1000));
};

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

export const configurator = createApp(AppComponent, configCallback, [moduleAgrGrid]);

export const App = () => {
    const framework = useFramework();
    const Component = configurator(framework, { name: 'test-app' });
    return (
        <Suspense fallback={<StarProgress text="Loading Application" />}>
            <Component />
        </Suspense>
    );
};

export default App;
