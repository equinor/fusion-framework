import { Suspense } from 'react';

import createApp, { AppConfigurator } from '@equinor/fusion-framework-react-app';
import {
    useCurrentUser,
    useFramework,
    useModuleContext,
} from '@equinor/fusion-framework-react-app/hooks';
import { AppList } from 'AppList';

import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import { StarProgress } from '@equinor/fusion-react-progress-indicator';

interface App {
    key: string;
    name: string;
}

const configCallback: AppConfigurator = async (appModuleConfig, frameworkApi) => {
    console.debug(0, 'configuring app', frameworkApi, appModuleConfig);
    await frameworkApi.modules.serviceDiscovery.configureClient('portal', appModuleConfig);
    await new Promise((resolve) => setTimeout(resolve, 1000));
};

const queryClient = new QueryClient();

export const AppComponent = (): JSX.Element => {
    const framework = useFramework();
    const modules = useModuleContext();
    const account = useCurrentUser();
    // const client = useHttpClient();
    // const queryClient = useMemo(() => {}, [client]);
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

export const configurator = createApp(AppComponent, configCallback);

export const App = () => {
    const framework = useFramework();
    const Component = configurator(framework, {});
    return (
        <Suspense fallback={<StarProgress text="Loading Application" />}>
            <Component />
        </Suspense>
    );
};

export default App;
