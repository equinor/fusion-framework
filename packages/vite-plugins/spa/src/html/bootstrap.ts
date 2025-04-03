import { ModulesConfigurator } from '@equinor/fusion-framework-module';

import { configureHttpClient, type HttpModule } from '@equinor/fusion-framework-module-http';
import { enableMSAL, type MsalModule } from '@equinor/fusion-framework-module-msal';
import {
  enableServiceDiscovery,
  type ServiceDiscoveryModule,
} from '@equinor/fusion-framework-module-service-discovery';
import { registerServiceWorker } from './register-service-worker.js';

// Allow dynamic import without vite
const importWithoutVite = <T>(path: string): Promise<T> => import(/* @vite-ignore */ path);

// Create Fusion Framework configurator
const configurator = new ModulesConfigurator();

configurator.logger.level = import.meta.env.FUSION_SPA_LOG_LEVEL ?? 1;

const serviceDiscoveryUrl = new URL(
  import.meta.env.FUSION_SPA_SERVICE_DISCOVERY_URL,
  import.meta.env.FUSION_SPA_SERVICE_DISCOVERY_URL.startsWith('http')
    ? undefined
    : window.location.origin,
);

// define service discovery client - this is used in the service discovery module
configurator.addConfig(
  configureHttpClient('service_discovery', {
    baseUri: String(serviceDiscoveryUrl),
    defaultScopes: import.meta.env.FUSION_SPA_SERVICE_DISCOVERY_SCOPES,
  }),
);

// setup service discovery - enable service discovery for the framework
enableServiceDiscovery(configurator, async (builder) => {
  builder.configureServiceDiscoveryClientByClientKey('service_discovery');
});

// setup authentication
enableMSAL(configurator, (builder) => {
  builder.setClientConfig({
    tenantId: import.meta.env.FUSION_SPA_MSAL_TENANT_ID,
    clientId: import.meta.env.FUSION_SPA_MSAL_CLIENT_ID,
    redirectUri: import.meta.env.FUSION_SPA_MSAL_REDIRECT_URI,
  });

  builder.setRequiresAuth(Boolean(import.meta.env.FUSION_SPA_MSAL_REQUIRES_AUTH));
});

(async () => {
  // initialize the framework - this will create the framework instance and configure the modules
  const ref = await configurator.initialize<[ServiceDiscoveryModule, HttpModule, MsalModule]>();

  // attach service discovery to the framework - append auth token to configured endpoints
  await registerServiceWorker(ref);

  // create a client for the portal service - this is used to fetch the portal manifest
  const portalClient = await ref.serviceDiscovery.createClient('portal-service');

  // fetch the portal manifest - this is used to load the portal template
  const portalId = import.meta.env.FUSION_SPA_PORTAL_ID;
  const portal_manifest = await portalClient.json<{
    bundle: { entrypoint: string };
    config: Record<string, unknown>;
  }>(`/portal/${portalId}/manifest`);

  // create a entrypoint for the portal - this is used to render the portal
  const el = document.createElement('div');
  document.body.appendChild(el);

  // @todo: should test if the entrypoint is external or internal
  // @todo: add proper return type
  const { render } = await importWithoutVite<Promise<{ render: (...args: unknown[]) => void }>>(
    portal_manifest.bundle.entrypoint,
  );

  // render the portal - this will load the portal template and render it
  render(el, { ref, config: portal_manifest.config });
})();
