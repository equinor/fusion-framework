import { defineConfig, mergeConfig, type UserConfig } from 'vite';

import reactPlugin from '@vitejs/plugin-react';

import apiServicePlugin, {
  createProxyHandler,
} from '@equinor/fusion-framework-vite-plugin-api-service';

import fusionSpaPlugin from '@equinor/fusion-framework-vite-plugin-spa';
import { ConsoleLogger, LogLevel } from '@equinor/fusion-log';

import { processServices as defaultProcessServices } from './process-services.js';

import type { DevServerOptions, TemplateEnv, TemplateEnvFn } from './types.js';

/**
 * Create a default {@link ConsoleLogger} instance for the dev server.
 *
 * @param lvl - Log verbosity level; defaults to {@link LogLevel.Info}.
 * @param title - Logger title printed as a prefix in console output; defaults to `'dev-server'`.
 * @returns A configured {@link ConsoleLogger} instance.
 */
const createDefaultLogger = (lvl: LogLevel = LogLevel.Info, title = 'dev-server') => {
  const logger = new ConsoleLogger(title);
  logger.level = lvl;
  return logger;
};

/**
 * Build a Vite {@link import('vite').UserConfig | UserConfig} for a Fusion Framework dev server
 * without starting the server.
 *
 * Use this function when you need control over the server lifecycle (e.g. to pass the config
 * to another Vite tool). For a simpler create-and-listen workflow, use {@link createDevServer}.
 *
 * The generated config includes:
 * - `@vitejs/plugin-react` for React Fast Refresh / HMR
 * - `@equinor/fusion-framework-vite-plugin-api-service` for service discovery proxying
 * - `@equinor/fusion-framework-vite-plugin-spa` for template environment injection
 * - CORS disabled so backend services handle OPTIONS with proper headers
 *
 * @template TEnv - Environment variable shape extending `Partial<TemplateEnv>`, used to type-check
 *                  the SPA template environment object or factory function.
 * @param options - Development server options containing SPA, API, and logging settings.
 * @param overrides - Optional Vite config merged on top of the generated base config via
 *                    {@link import('vite').mergeConfig | mergeConfig}.
 * @returns A fully resolved Vite `UserConfig` ready for {@link import('vite').createServer | createServer}.
 *
 * @remarks
 * - `spa.templateEnv` accepts either a static object or a factory function returning the environment.
 * - `api.processServices` defaults to the built-in {@link processServices} when omitted.
 * - The default log level is `Info`; set `log.level` to `4` for debug output.
 *
 * @example
 * ```typescript
 * import { createDevServerConfig } from '@equinor/fusion-framework-dev-server';
 * import { createServer } from 'vite';
 *
 * const config = createDevServerConfig({
 *   spa: {
 *     templateEnv: {
 *       portal: { id: 'my-portal' },
 *       title: 'My App',
 *       serviceDiscovery: { url: 'https://discovery.example.com', scopes: [] },
 *       msal: { clientId: 'cid', tenantId: 'tid', redirectUri: '/auth/cb', requiresAuth: 'true' },
 *     },
 *   },
 *   api: { serviceDiscoveryUrl: 'https://discovery.example.com' },
 * });
 *
 * const server = await createServer(config);
 * await server.listen();
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
    server: {
      // Disable Vite's internal CORS handling to allow backend to handle OPTIONS requests properly
      // This ensures that OPTIONS requests are forwarded to the backend with proper headers
      cors: false,
    },
    plugins: [
      reactPlugin(),
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
