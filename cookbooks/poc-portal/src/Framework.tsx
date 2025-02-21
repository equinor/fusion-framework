/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Suspense } from 'react';
import type { ModulesInstanceType } from '@equinor/fusion-framework-module';
import { createFrameworkProvider } from '@equinor/fusion-framework-react';

import { type AppModule, enableAppModule } from '@equinor/fusion-framework-module-app';
import AppList from './AppList';

export const Framework = (args: { modules: ModulesInstanceType<[]> }) => {
  const FrameworkProvider = createFrameworkProvider((configurator) => {
    enableAppModule(configurator, (builder) => {
      builder.setAssetUri('/apps-proxy/bundles/apps');
    });

    if (process.env.NODE_ENV === 'development') {
      configurator.configureHttpClient('app', {
        baseUri: new URL('/apps-proxy/', window.location.href).href,
        defaultScopes: ['5a842df8-3238-415d-b168-9f16a6a6031b/.default'],
      });
    }

    configurator.onInitialized((instance) => {
      (instance as unknown as ModulesInstanceType<[AppModule]>).app.setCurrentApp(
        // 'fusion-framework-cookbook-app-react',
        'poc-portal',
      );
      // @ts-ignore
      window.test = instance;
    });
  }, args.modules);
  return (
    <Suspense fallback={<p>:/</p>}>
      <FrameworkProvider>
        <AppList />
      </FrameworkProvider>
    </Suspense>
  );
};

export default Framework;
