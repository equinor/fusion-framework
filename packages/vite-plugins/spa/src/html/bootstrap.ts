import { ModulesConfigurator } from '@equinor/fusion-framework-module';

import { configureHttpClient, type HttpModule } from '@equinor/fusion-framework-module-http';
import { enableMSAL, type MsalModule } from '@equinor/fusion-framework-module-msal';
import {
  enableServiceDiscovery,
  type ServiceDiscoveryModule,
} from '@equinor/fusion-framework-module-service-discovery';

import {
  enableTelemetry,
  TelemetryLevel,
  type TelemetryModule,
} from '@equinor/fusion-framework-module-telemetry';
import { ConsoleAdapter } from '@equinor/fusion-framework-module-telemetry/console-adapter';

import { registerServiceWorker } from './register-service-worker.js';

import { version } from '../version.js';

// @todo - add type for portal manifest when available
type PortalManifest = {
  build: {
    config: Record<string, unknown>;
    templateEntry: string;
    assetPath?: string;
  };
};

// Allow dynamic import without vite
const importWithoutVite = <T>(path: string): Promise<T> => import(/* @vite-ignore */ path);

// Create Fusion Framework configurator
const configurator = new ModulesConfigurator();

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

enableTelemetry(configurator, {
  attachConfiguratorEvents: true,
  configure: (builder) => {
    const consoleLevel = Number(
      import.meta.env.FUSION_SPA_TELEMETRY_CONSOLE_LEVEL ?? TelemetryLevel.Information,
    );

    if (!isNaN(consoleLevel)) {
      builder.setAdapter(
        new ConsoleAdapter({
          filter: (item) => item.level >= consoleLevel,
        }),
      );
    } else {
      // If environment variable is invalid, use default console logging behavior
      builder.setAdapter(new ConsoleAdapter());
    }
    builder.setMetadata(({ modules }) => {
      const metadata = {
        fusion: {
          spa: {
            version,
          },
        },
        // biome-ignore lint/suspicious/noExplicitAny: we need to use any here to allow dynamic properties
      } as Record<string, any>;
      if (modules?.auth) {
        metadata.fusion.user = {
          id: modules.auth.defaultAccount?.homeAccountId,
          name: modules.auth.defaultAccount?.name,
          email: modules.auth.defaultAccount?.username,
        };
      }
      return metadata;
    });
  },
});

(async () => {
  // initialize the framework - this will create the framework instance and configure the modules
  const ref =
    await configurator.initialize<
      [ServiceDiscoveryModule, HttpModule, MsalModule, TelemetryModule]
    >();

  const telemetry = ref.telemetry;

  // attach service discovery to the framework - append auth token to configured endpoints
  using measurement = telemetry.measure({
    name: 'bootstrap',
    level: TelemetryLevel.Information,
  });

  await measurement.clone().resolve(registerServiceWorker(ref), {
    data: {
      level: TelemetryLevel.Debug,
      name: 'bootstrap::registerServiceWorker',
    },
  });

  // create a client for the portal service - this is used to fetch the portal manifest
  const portalClient = await ref.serviceDiscovery.createClient('portal-config');

  // fetch the portal manifest - this is used to load the portal template
  const portalId = import.meta.env.FUSION_SPA_PORTAL_ID;
  const portalTag = import.meta.env.FUSION_SPA_PORTAL_TAG ?? 'latest';
  const portal_manifest = await measurement
    .clone()
    .resolve(portalClient.json<PortalManifest>(`/portals/${portalId}@${portalTag}`), {
      data: (manifest: PortalManifest) => ({
        name: 'bootstrap::loadPortalManifest',
        level: TelemetryLevel.Debug,
        properties: {
          portalId,
          portalTag,
          templateEntry: manifest.build.templateEntry,
          manifestVersion: manifest.build.config?.version,
          assetPath: manifest.build.assetPath,
        },
      }),
    });

  const portal_config = await measurement
    .clone()
    .resolve(portalClient.json(`/portals/${portalId}@${portalTag}/config`), {
      data: {
        name: 'bootstrap::loadPortalConfig',
        level: TelemetryLevel.Debug,
        properties: {
          portalId,
          portalTag,
        },
      },
    });

  // create a entrypoint for the portal - this is used to render the portal
  const el = document.createElement('div');
  document.body.innerHTML = '';
  document.body.appendChild(el);

  const portalEntryPoint = [portal_manifest.build.assetPath, portal_manifest.build.templateEntry]
    .filter(Boolean)
    .join('/');

  // @todo: should test if the entrypoint is external or internal
  // @todo: add proper return type
  const { render } = await measurement
    .clone()
    .resolve(
      importWithoutVite<Promise<{ render: (...args: unknown[]) => void }>>(portalEntryPoint),
      {
        data: {
          name: 'bootstrap::loadPortalSourceCode',
          level: TelemetryLevel.Debug,
          properties: {
            portalId,
            portalTag,
            entryPoint: portalEntryPoint,
          },
        },
      },
    );

  // render the portal - this will load the portal template and render it
  render(el, { ref, manifest: portal_manifest, config: portal_config });
})();
