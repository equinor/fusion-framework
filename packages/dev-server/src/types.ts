import type { ApiDataProcessor, ApiRoute } from '@equinor/fusion-framework-vite-plugin-api-service';
import type { FusionTemplateEnv, TemplateEnvFn } from '@equinor/fusion-framework-vite-plugin-spa';
import type { ConsoleLogger } from '@equinor/fusion-log';

/**
 * A service entry returned by the Fusion service discovery endpoint.
 *
 * Each entry represents a single backend service that can be proxied
 * through the development server via {@link processServices}.
 */
export type FusionService = {
  /** Unique service identifier used as the proxy path segment (e.g. `'context'`, `'people'`). */
  key: string;
  /** Absolute URL of the upstream service endpoint. */
  uri: string;
  /** Human-readable display name of the service. */
  name: string;
};

/**
 * Re-export of {@link FusionTemplateEnv} under the local alias `TemplateEnv`.
 *
 * Describes the environment variables injected into the SPA HTML template
 * (portal ID, service discovery URL, MSAL settings, telemetry level, etc.).
 */
export {
  FusionTemplateEnv as TemplateEnv,
  TemplateEnvFn,
} from '@equinor/fusion-framework-vite-plugin-spa';

/**
 * Alias for Vite's `UserConfig`, used as the optional overrides parameter
 * of {@link createDevServer} and {@link createDevServerConfig}.
 */
export { UserConfig as DevServerOverrides } from 'vite';

/**
 * Configuration options for the Fusion Framework development server.
 *
 * Pass an instance of this type to {@link createDevServer} or {@link createDevServerConfig}
 * to configure SPA template injection, API service discovery proxying, and server-side logging.
 *
 * @template TEnv - Shape of the SPA template environment variables, extending
 *                  `Partial<FusionTemplateEnv>`. Defaults to `Partial<FusionTemplateEnv>`.
 *
 * @example
 * ```typescript
 * const opts: DevServerOptions = {
 *   spa: {
 *     templateEnv: {
 *       portal: { id: 'my-portal' },
 *       title: 'My App',
 *       serviceDiscovery: { url: 'https://discovery.example.com', scopes: [] },
 *       msal: { clientId: 'id', tenantId: 'tid', redirectUri: '/auth/cb', requiresAuth: 'true' },
 *     },
 *   },
 *   api: { serviceDiscoveryUrl: 'https://discovery.example.com' },
 *   log: { level: 3 },
 * };
 * ```
 */
export type DevServerOptions<TEnv extends Partial<FusionTemplateEnv> = Partial<FusionTemplateEnv>> =
  {
    /** SPA template settings. When provided, the dev server injects these values into the HTML template at serve time. */
    spa?: {
      /** Static environment object or factory function that produces it on each request. */
      templateEnv: TEnv | TemplateEnvFn<TEnv>;
    };
    api: {
      /**
       * The URL of the service discovery proxy endpoint.
       */
      serviceDiscoveryUrl: string;

      /**
       * Route mapper for processing service discovery data.
       */
      processServices?: ApiDataProcessor<FusionService[]>;

      /**
       * Additional routes to be added to the API service proxy.
       * @remarks used for overriding proxy responses and mocking services.
       */
      routes?: ApiRoute[];
    };
    /** Server-side (CLI) logging configuration. */
    log?: {
      /** Log verbosity: 0 = None, 1 = Error, 2 = Warning, 3 = Info, 4 = Debug. Defaults to Info (3). */
      level?: number;
      /** Custom logger instance. When omitted a default {@link ConsoleLogger} is created. */
      logger?: ConsoleLogger;
    };
  };
