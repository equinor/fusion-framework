import { defineConfig, mergeConfig, type UserConfig } from 'vite';
import apiServicePlugin, {
  createProxyHandler,
} from '@equinor/fusion-framework-vite-plugin-api-service';

import fusionSpaPlugin from '@equinor/fusion-framework-vite-plugin-spa';
import { ConsoleLogger, LogLevel } from '@equinor/fusion-log';

import { processServices as defaultProcessServices } from './process-services.js';

import type { DevServerOptions, TemplateEnv, TemplateEnvFn } from './types.js';

const createDefaultLogger = (lvl: LogLevel = LogLevel.Info, title = 'dev-server') => {
  const logger = new ConsoleLogger(title);
  logger.level = lvl;
  return logger;
};

/**
 * Creates a development server configuration for a Fusion Framework application.
 *
 * @template TEnv - A type extending `Partial<TemplateEnv>` that represents the environment variables for the template.
 * @param options - The options for configuring the development server.
 * @param options.spa - Configuration for the Single Page Application (SPA), including template environment settings.
 * @param options.api - Configuration for the API, including service discovery URL, routes, and service processing logic.
 *
 * @returns A `UserConfig` object that defines the Vite development server configuration.
 *
 * @remarks
 * - The `spa.templateEnv` can either be a function or a partial object of type `TEnv`.
 * - The `api.processServices` defaults to `defaultProcessServices` if not provided.
 * - The server is configured to run on port 3000.
 * - Includes plugins for API service handling and SPA template environment generation.
 *
 * @example
 * ```typescript
 * const config = createDevServerConfig({
 *   spa: {
 *     templateEnv: { API_URL: 'https://api.example.com' },
 *   },
 *   api: {
 *     serviceDiscoveryUrl: 'https://discovery.example.com',
 *     routes: ['/api'],
 *   },
 * });
 * ```
 */
export const createDevServerConfig = <TEnv extends Partial<TemplateEnv>>(
  options: DevServerOptions<TEnv>,
  overrides?: UserConfig,
): UserConfig => {
  const { spa, api, log } = options;
  const processServices = api.processServices ?? defaultProcessServices;
  const generateTemplateEnv: TemplateEnvFn<TEnv> =
    // ensure that the templateEnv is a function
    typeof spa?.templateEnv === 'function'
      ? spa.templateEnv
      : () => spa?.templateEnv as Partial<TEnv>;

  // setup log instance
  const logger = log?.logger ?? createDefaultLogger(log?.level);

  const apiServiceLogger = logger.createSubLogger('api-service');
  const spaLogger = logger.createSubLogger('spa');

  const baseConfig = defineConfig({
    appType: 'custom',
    define: {
      'process.env': JSON.stringify({
        FUSION_LOG_LEVEL: String(logger.level),
      }),
    },
    plugins: [
      apiServicePlugin(
        {
          proxyHandler: createProxyHandler(api.serviceDiscoveryUrl, processServices, {
            logger: apiServiceLogger,
          }),
          routes: api.routes,
        },
        {
          logger: apiServiceLogger,
        },
      ),
      fusionSpaPlugin({ generateTemplateEnv, logger: spaLogger }),
    ],
  });
  return mergeConfig(baseConfig, overrides ?? {});
};

export default createDevServerConfig;
