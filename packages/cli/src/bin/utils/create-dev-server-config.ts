import type { AppManifest } from '@equinor/fusion-framework-module-app';
import type { ApiAppConfig } from '@equinor/fusion-framework-module-app/schemas.js';

import { processServices, type DevServerOptions, type FusionTemplateEnv } from '@equinor/fusion-framework-dev-server';

/**
 * PortalManifest describes the minimal structure required for a portal manifest.
 * Used for dev server portal routing and config.
 */
type PortalManifest = {
  name: string;
  build: {
    templateEntry: string;
    assetPath?: string; // Optional, used for local dev server routing
  };
};

/**
 * PortalConfig is a placeholder for portal-specific configuration.
 * Replace 'any' with a more specific type as needed.
 */
type PortalConfig = Record<string, unknown>; // Use a more specific type if available

/**
 * Options for creating a dev server configuration.
 *
 * @property template - Optional template environment overrides.
 * @property portal - Optional portal manifest and config.
 * @property app - Optional app manifest and config.
 * @property server - Optional server options for the dev server.
 */
export type CreateDevServerOptions = {
  template?: Partial<FusionTemplateEnv>;
  portal?: {
    manifest: PortalManifest;
    config?: PortalConfig;
  };
  app?: {
    manifest: AppManifest;
    config?: ApiAppConfig;
  };
  // server?: DevServerOptions['server'];
};

/**
 * Creates a Fusion dev server template environment, merging with user overrides.
 *
 * @param overrides - Partial template environment to override defaults.
 * @returns The dev server template environment without the 'bootstrap' property.
 */
const createDevServerTemplate = (
  overrides?: Partial<FusionTemplateEnv>,
): Omit<FusionTemplateEnv, 'bootstrap'> => ({
  portal: {
    id: '@equinor/fusion-framework-dev-portal',
  },
  title: 'Fusion Dev Portal',
  serviceDiscovery: {
    url: '/@fusion-services',
    scopes: ['5a842df8-3238-415d-b168-9f16a6a6031b/.default'],
  },
  msal: {
    clientId: '9b707e3a-3e90-41ed-a47e-652a1e3b53d0',
    tenantId: '3aa4a235-b6e2-48d5-9195-7fcf05b459b0',
    redirectUri: '/authentication/login-callback',
    requiresAuth: 'true',
  },
  serviceWorker: {
    // default proxies
    resources: [
      {
        url: '/apps-proxy',
        rewrite: '/@fusion-api/apps',
        scopes: ['5a842df8-3238-415d-b168-9f16a6a6031b/.default'],
      },
      {
        url: '/@fusion-api/apps',
        scopes: ['5a842df8-3238-415d-b168-9f16a6a6031b/.default'],
      },
      {
        url: '/help-proxy',
        rewrite: '/@fusion-api/help',
        scopes: ['5a842df8-3238-415d-b168-9f16a6a6031b/.default'],
      },
      {
        url: '/portal-proxy',
        rewrite: '/@fusion-api/portal-config',
        scopes: ['5a842df8-3238-415d-b168-9f16a6a6031b/.default'],
      },
      {
        // Inject auth for direct portal-config API calls (manifest and config fetches).
        // This keeps portal bootstrap requests authenticated even when they are issued
        // before the regular client token flow has attached Authorization headers.
        url: '/@fusion-api/portal-config',
        scopes: ['5a842df8-3238-415d-b168-9f16a6a6031b/.default'],
      },
    ],
  },
  // TODO(#5069): deep merge with user config
  ...overrides,
});

/**
 * Adds app-specific API routes for local development.
 * Handles rewrites for app bundles, manifest, and config endpoints.
 *
 * @param base - The dev server options object to mutate.
 * @param manifest - The app manifest.
 * @param config - Optional app config.
 */
const applyAppRouting = (base: DevServerOptions, manifest: AppManifest, config?: ApiAppConfig) => {
  const { build, appKey } = manifest;
  // Routing requires build info to construct bundle paths
  if (!build) {
    throw new Error('App manifest does not contain build information');
  }
  base.api.routes ??= [];

  // add rewrite to local fs
  base.api.routes.push({
    match: [
      `/apps/bundles/apps/${appKey}/${build.version}/*path`,
      `/apps/bundles/apps/${appKey}@${build.version}/*path`,
    ],
    middleware: async (req, res, next) => {
      const location = req.params?.path as string[];
      // Bail out early if the wildcard route param didn't resolve to an array
      if (Array.isArray(location) === false) {
        next();
      }
      res.writeHead(302, {
        'content-type': 'application/javascript',
        location: `/${location.join('/')}`,
      });
      res.end();
    },
  });

  // catch requests for local app manifest
  base.api.routes.push({
    match: `/apps/persons/me/apps/${appKey}`,
    middleware: async (_req, res) => {
      res.writeHead(200, {
        'content-type': 'application/json',
      });
      res.end(
        JSON.stringify({
          id: 'dev-server-generated-id',
          ...manifest,
        }),
      );
    },
  });

  base.api.routes.push({
    match: `/apps/apps/${appKey}/builds/${build.version}/config`,
    middleware: async (_req, res) => {
      res.writeHead(200, {
        'content-type': 'application/json',
      });
      res.end(JSON.stringify(config));
    },
  });
};

/**
 * Adds portal-specific API routes for local development.
 * Handles endpoints for portal manifest and config.
 *
 * @param base - The dev server options object to mutate.
 * @param manifest - The portal manifest.
 * @param config - Optional portal config.
 */
const applyPortalRouting = (
  base: DevServerOptions,
  manifest: PortalManifest,
  config?: PortalConfig,
) => {
  base.api.routes ??= [];

  // TODO(#5074): might add correct tag handling later
  const serviceName = 'portal-config';

  base.api.routes.push({
    match: `/${serviceName}/portals/${manifest.name}{@:tag}`,
    middleware: async (_req, res) => {
      res.writeHead(200, {
        'content-type': 'application/json',
      });
      res.end(JSON.stringify(manifest));
    },
  });
  // TODO(#5068): should config be allowed, dev-server.config could be used instead
  if (config) {
    base.api.routes.push({
      match: `/${serviceName}/portals/${manifest.name}{@:tag}/config`,
      middleware: async (_req, res) => {
        res.writeHead(200, {
          'content-type': 'application/json',
        });
        res.end(JSON.stringify(config));
      },
    });
  }
};

/**
 * Creates the full dev server configuration for Fusion CLI.
 * Applies app and portal routing as needed.
 *
 * @param options - Options for dev server config, including app/portal manifests and overrides.
 * @returns The complete dev server options object.
 */
export const createDevServerConfig = (options: CreateDevServerOptions) => {
  const config: DevServerOptions = {
    spa: {
      templateEnv: createDevServerTemplate(options.template),
    },
    api: {
      serviceDiscoveryUrl:
        'https://discovery.fusion.equinor.com/service-registry/environments/ci/services/',
      processServices: (dataResponse, route) => {
        const { data, routes } = processServices(dataResponse, route);
        return {
          // TODO(#5071): remove this when we have a real service discovery
          data: data.concat({
            key: 'portals',
            name: 'Portal Service - MOCK',
            uri: '/@fusion-api/portals',
          }),
          routes,
        };
      },
    },
  };

  // Only wire up app routing when an app manifest was provided
  if (options.app) {
    applyAppRouting(config, options.app.manifest, options.app.config);
  }

  // Only wire up portal routing when a portal manifest was provided
  if (options.portal) {
    applyPortalRouting(config, options.portal.manifest, options.portal.config);
  }

  return config;
};
