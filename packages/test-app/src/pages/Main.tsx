import { CodeInfo } from '../components';
import { ServicesModule } from '@equinor/fusion-framework-module-services';
import { useAppModules } from '@equinor/fusion-framework-react-app';
import { useCurrentUser, useFramework } from '@equinor/fusion-framework-react-app/framework';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useCurrentContext } from './context/GetContext';

const queryClient = new QueryClient();

export const Main = (): JSX.Element => {
    const framework = useFramework();
    const modules = useAppModules<[ServicesModule]>();

    const account = useCurrentUser();
    const context = useCurrentContext();
    return (
        <div>
            <h3>Current user</h3>
            <CodeInfo data={account} />
            <h3>Registered modules in Framework</h3>
            <ul>
                {Object.keys(framework.modules).map((x) => (
                    <li key={x}>{x}</li>
                ))}
            </ul>
            <h3>App Config</h3>
            <h3>Registered modules in App</h3>
            <ul>
                {Object.keys(modules).map((x) => (
                    <li key={x}>{x}</li>
                ))}
            </ul>
            <h3>Current Context</h3>
            <CodeInfo data={context} />
            <QueryClientProvider client={queryClient}>
                <ReactQueryDevtools initialIsOpen />
            </QueryClientProvider>
        </div>
    );
};
