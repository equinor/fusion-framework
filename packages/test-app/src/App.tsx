import React from 'react';

import { createComponent, renderComponent } from '@equinor/fusion-framework-react-app';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import { enableAgGrid, AgGridModule } from '@equinor/fusion-framework-module-ag-grid';
import { AppModuleInitiator } from '@equinor/fusion-framework-app';

import { enableContext } from '@equinor/fusion-framework-module-context';
import { enableBookmark } from '@equinor/fusion-framework-module-bookmark';

import { module as serviceModule } from '@equinor/fusion-framework-module-services';
import { RouterProvider } from 'react-router-dom';

import { createRoutes } from './router';

const queryClient = new QueryClient();

const configure: AppModuleInitiator = async (config) => {
    config.logger.level = 4;

    enableAgGrid(config);

    enableContext(config);
    enableBookmark(config);

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

export const render = renderComponent((el, args) => {
    const router = createRoutes(args?.basename);
    const componentRenderer = createComponent(
        () => (
            <QueryClientProvider client={queryClient}>
                <ReactQueryDevtools initialIsOpen />
                <RouterProvider router={router} />
            </QueryClientProvider>
        ),
        configure
    );
    return componentRenderer(el, args);
});

export default render;
