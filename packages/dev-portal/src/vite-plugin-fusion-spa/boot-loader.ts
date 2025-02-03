/* eslint-disable @typescript-eslint/ban-ts-comment */
import { ModulesConfigurator } from '@equinor/fusion-framework-module';

import { configureHttpClient } from '@equinor/fusion-framework-module-http';
import { configureMsal } from '@equinor/fusion-framework-module-msal';
import { enableServiceDiscovery } from '@equinor/fusion-framework-module-service-discovery';

// const environment = 'ci';

const configurator = new ModulesConfigurator();

// const importWithoutVite = (path: string) => import(/* @vite-ignore */ path);

configurator.logger.level = process.env.NODE_ENV === 'development' ? 4 : 1;

const serviceDiscoveryEndpoint = new URL(import.meta.env.VITE_SERVICE_DISCOVERY_URL);

configurator.addConfig(
    configureHttpClient('service_discovery', {
        baseUri: serviceDiscoveryEndpoint.origin,
        defaultScopes: [import.meta.env.VITE_SERVICE_DISCOVERY_SCOPE],
    }),
);

enableServiceDiscovery(configurator, async (builder) => {
    builder.configureServiceDiscoveryClientByClientKey(
        'service_discovery',
        import.meta.env.VITE_SERVICE_DISCOVERY_CLIENT_KEY,
    );
});

configurator.addConfig(
    configureMsal(
        {
            tenantId: import.meta.env.VITE_MSAL_TENANT_ID,
            clientId: import.meta.env.VITE_MSAL_CLIENT_ID,
            redirectUri: import.meta.env.VITE_MSAL_REDIRECT_URI,
        },
        {
            requiresAuth: Boolean(import.meta.env.VITE_MSAL_REQUIRES_AUTH),
        },
    ),
);

(async () => {
    const ref = await configurator.initialize();
    console.log('Initialized', ref);

    const portalClient = ref.modules.http.createHttpClient('portal');

    const portalId = import.meta.env.VITE_PORTAL_ID;
    const portal_manifest = await portalClient.get(`/api-proxy/manifest?${portalId}`);

    const portal_config = await importWithoutVite(portal_manifest.bundle.config);

    // import portal template from configured environment
    // const el = document.getElementById('app');
    const { render } = await importWithoutVite(portal_manifest.bundle.entrypoint);
    // // @ts-ignore
    render(el, { ref, config: portal_config });
})();
