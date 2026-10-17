/* eslint-disable @typescript-eslint/ban-ts-comment */
import { ModulesConfigurator } from '@equinor/fusion-framework-module';

import { configureHttpClient } from '@equinor/fusion-framework-module-http';
import { configureMsal } from '@equinor/fusion-framework-module-msal';
import { enableServiceDiscovery } from '@equinor/fusion-framework-module-service-discovery';

const environment = 'ci';

const configurator = new ModulesConfigurator();

const importWithoutVite = (path: string) => import(/* @vite-ignore */ path);

configurator.logger.level = process.env.NODE_ENV === 'development' ? 4 : 1;

configurator.addConfig(
  configureHttpClient('service_discovery', {
    baseUri: 'https://discovery.fusion.equinor.com',
    defaultScopes: ['5a842df8-3238-415d-b168-9f16a6a6031b/.default'],
  }),
);

enableServiceDiscovery(configurator, async (builder) => {
  builder.configureServiceDiscoveryClientByClientKey(
    'service_discovery',
    `/service-registry/environments/${environment}/services`,
  );
});

configurator.addConfig(
  configureMsal(
    {
      tenantId: '3aa4a235-b6e2-48d5-9195-7fcf05b459b0',
      clientId: '9b707e3a-3e90-41ed-a47e-652a1e3b53d0',
      redirectUri: '/authentication/login-callback',
    },
    { requiresAuth: true },
  ),
);

(async () => {
  const ref = await configurator.initialize();

  const isEmbedded = window !== window.parent;
  const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
  const searchParams = new URLSearchParams(window.location.search.replace(/^\?/, ''));
  // MSAL's response_mode is configurable (query, fragment, or a hybrid of both), so an MSAL
  // response param can arrive in either the fragment or the query string on redirect
  const hasMsalResponseParam = ['code', 'error', 'state'].some(
    (param) => hashParams.has(param) || searchParams.has(param),
  );
  // MSAL reloads this bootstrap inside a hidden iframe to process a redirect response; stop
  // here so no unauthenticated scoped request reaches service discovery while the parent frame
  // is still completing authentication.
  if (isEmbedded && hasMsalResponseParam) {
    return;
  }

  const el = document.getElementById('app');
  const { render } = await importWithoutVite('../src/index.tsx');
  // @ts-expect-error
  render(el, ref);
})();
