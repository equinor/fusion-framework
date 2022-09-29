import React, { Suspense } from 'react';

import { createComponent } from '@equinor/fusion-framework-react-app';
import { useFramework } from '@equinor/fusion-framework-react-app/framework';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { StarProgress } from '@equinor/fusion-react-progress-indicator';

import { enableAgGrid, AgGridModule } from '@equinor/fusion-framework-module-ag-grid';
import { AppModuleInitiator } from '@equinor/fusion-framework-app';

import { module as serviceModule } from '@equinor/fusion-framework-module-services';
import { RouterProvider } from 'react-router-dom';

import { router } from './router';

interface App {
    key: string;
    name: string;
}

const queryClient = new QueryClient();

const configure: AppModuleInitiator = async (config, { fusion }) => {
    config.logger.level = 4;
    enableAgGrid(config);
    await config.useFrameworkServiceClient('portal');
    config.onInitialized<[AgGridModule]>((instance) => {
        instance.agGrid;
    });
    config.onInitialized((instance) => {
        instance.appConfig;
    });
    config.addConfig({
        module: serviceModule,
    });
};

export const creator = createComponent(() => <RouterProvider router={router} />, configure);

export const App = () => {
    const fusion = useFramework();
    const Component = creator(fusion, { name: 'test-app' });
    return (
        <React.StrictMode>
            <QueryClientProvider client={queryClient}>
                <ReactQueryDevtools initialIsOpen />
                <Suspense fallback={<StarProgress text="Loading Application" />}>
                    <Component />
                </Suspense>
            </QueryClientProvider>
        </React.StrictMode>
    );
};

export default App;
