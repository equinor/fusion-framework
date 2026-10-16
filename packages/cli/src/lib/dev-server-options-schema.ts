import { z } from 'zod';

import type { DevServerOptions } from '@equinor/fusion-framework-dev-server';

type ConfiguredRoute = NonNullable<DevServerOptions['api']['routes']>[number];
type TemplateEnvironment = NonNullable<NonNullable<DevServerOptions['spa']>['templateEnv']>;

const routeMatchSchema = z
  .custom<ConfiguredRoute['match']>(
    (value) =>
      typeof value === 'string' ||
      typeof value === 'function' ||
      // String array entries support multiple route path patterns.
      (Array.isArray(value) &&
        value
          // Require every path pattern to be a string before accepting the matcher.
          .every((item) => typeof item === 'string')),
    { error: 'Route match must be a string, string array, or matcher function.' },
  )
  .describe('Path pattern or matcher function used to select requests for this route.');

const routeSchema = z
  .union(
    [
      z
        .object({
          match: routeMatchSchema,
          middleware: z
            .custom<NonNullable<ConfiguredRoute['middleware']>>(
              (value) => typeof value === 'function',
              { error: 'Route middleware must be a function.' },
            )
            .describe('Connect middleware called when the route matches.'),
          proxy: z.undefined().optional(),
        })
        .strict()
        .describe('A route handled by custom Connect middleware.'),
      z
        .object({
          match: routeMatchSchema,
          middleware: z.undefined().optional(),
          proxy: z
            .object({
              target: z
                .string({ error: 'Proxy target must be a non-empty URL.' })
                .min(1, { error: 'Proxy target must be a non-empty URL.' })
                .describe('Upstream URL that receives requests matched by this route.'),
            })
            .passthrough()
            .describe('Vite proxy options for the matching route.'),
        })
        .strict(),
    ],
    { error: 'Route must be an object with match and either middleware or proxy.' },
  )
  .describe('A middleware or upstream proxy route.');

const templateEnvironmentObjectSchema = z
  .object({
    title: z
      .string({ error: 'Template title must be a string.' })
      .optional()
      .describe('HTML document title.'),
    bootstrap: z
      .string({ error: 'Bootstrap entry must be a string path.' })
      .optional()
      .describe('Module path used to bootstrap the SPA.'),
    telemetry: z
      .object({
        consoleLevel: z
          .number({ error: 'Telemetry console level must be a number.' })
          .optional()
          .describe('Minimum severity of browser telemetry written to the console.'),
      })
      .strict()
      .optional()
      .describe('Browser telemetry settings injected into the SPA.'),
    portal: z
      .object({
        id: z
          .string({ error: 'Portal ID must be a non-empty string.' })
          .min(1, { error: 'Portal ID must be a non-empty string.' })
          .describe('Identifier of the portal loaded by the SPA.'),
        tag: z
          .string({ error: 'Portal tag must be a string.' })
          .optional()
          .describe('Version tag used when resolving the portal manifest.'),
        proxy: z
          .boolean({ error: 'Portal proxy setting must be a boolean.' })
          .optional()
          .describe('Whether portal assets load through the local proxy.'),
      })
      .strict()
      .optional()
      .describe('Portal identity and asset-loading settings.'),
    serviceDiscovery: z
      .object({
        url: z
          .string({ error: 'Service discovery URL must be a non-empty string.' })
          .min(1, { error: 'Service discovery URL must be a non-empty string.' })
          .describe('URL used by the SPA to request service discovery.'),
        scopes: z
          .array(z.string({ error: 'Each service discovery scope must be a string.' }), {
            error: 'Service discovery scopes must be an array of strings.',
          })
          .describe('OAuth scopes requested when calling service discovery.'),
      })
      .strict()
      .optional()
      .describe('Service discovery endpoint and authentication settings.'),
    msal: z
      .object({
        tenantId: z
          .string({ error: 'MSAL tenant ID must be a string.' })
          .describe('Microsoft Entra tenant identifier.'),
        clientId: z
          .string({ error: 'MSAL client ID must be a string.' })
          .describe('Microsoft Entra application client identifier.'),
        redirectUri: z
          .string({ error: 'MSAL redirect URI must be a string.' })
          .describe('Authentication callback URI.'),
        requiresAuth: z
          .string({ error: 'MSAL requiresAuth must be a string.' })
          .describe('Whether the SPA should prompt for authentication on load.'),
        mock: z
          .union([z.string(), z.boolean()], {
            error: 'MSAL mock setting must be a string or boolean.',
          })
          .optional()
          .describe('Enables the in-process mock authentication client.'),
        mockServerUrl: z
          .string({ error: 'MSAL mock server URL must be a string.' })
          .optional()
          .describe('Origin of the mock server used for authentication.'),
      })
      .strict()
      .optional()
      .describe('Microsoft Authentication Library settings for the SPA.'),
    serviceWorker: z
      .object({
        resources: z
          .array(
            z
              .object({
                url: z
                  .string({ error: 'Service-worker resource URL must be a non-empty string.' })
                  .min(1, { error: 'Service-worker resource URL must be a non-empty string.' })
                  .describe('URL prefix intercepted by the service worker.'),
                scopes: z
                  .array(z.string({ error: 'Each resource scope must be a string.' }), {
                    error: 'Resource scopes must be an array of strings.',
                  })
                  .optional()
                  .describe('OAuth scopes requested for matching resource URLs.'),
                rewrite: z
                  .string({ error: 'Service-worker rewrite path must be a string.' })
                  .optional()
                  .describe('Path prefix substituted for the matched resource URL.'),
              })
              .strict()
              .describe('A service-worker URL interception and authentication rule.'),
            { error: 'Service-worker resources must be an array of resource rules.' },
          )
          .describe('Resource rules managed by the SPA service worker.'),
      })
      .strict()
      .optional()
      .describe('Service-worker request interception settings.'),
  })
  .strict()
  .describe('Object-valued Fusion SPA template environment settings.');

/**
 * Runtime schema for resolved CLI dev-server options.
 *
 * Callback-valued fields remain valid configuration; object-valued template settings and
 * serializable options are checked after defaults and user overrides have been merged.
 */
export const DevServerOptionsSchema = z
  .object({
    spa: z
      .object({
        templateEnv: z
          .union(
            [
              templateEnvironmentObjectSchema,
              z
                .custom<TemplateEnvironment>((value) => typeof value === 'function', {
                  error: 'SPA templateEnv must be an object or a function.',
                })
                .describe('Factory that creates SPA template environment values.'),
            ],
            { error: 'SPA templateEnv must be an object or a function.' },
          )
          .describe('Static SPA template environment values or a per-request factory.'),
      })
      .strict()
      .optional()
      .describe('SPA template configuration.'),
    api: z
      .object({
        serviceDiscoveryUrl: z
          .string({ error: 'API service discovery URL must be a non-empty string.' })
          .min(1, { error: 'API service discovery URL must be a non-empty string.' })
          .describe('Upstream URL used by the dev server to discover API services.'),
        processServices: z
          .custom<NonNullable<DevServerOptions['api']['processServices']>>(
            (value) => typeof value === 'function',
            { error: 'api.processServices must be a function.' },
          )
          .optional()
          .describe('Callback that transforms service discovery data and generated routes.'),
        routes: z
          .array(routeSchema, { error: 'API routes must be an array of route definitions.' })
          .optional()
          .describe('Custom middleware and proxy routes handled by the dev server.'),
        headers: z
          .record(z.string(), z.string(), {
            error: 'API headers must be an object with string values.',
          })
          .optional()
          .describe('Additional headers sent with proxied API requests.'),
      })
      .strict()
      .describe('Service discovery, request processing, and API proxy configuration.'),
    log: z
      .object({
        level: z
          .number({ error: 'Log level must be a number from 0 through 4.' })
          .optional()
          .describe('CLI log verbosity: 0 none, 1 error, 2 warning, 3 info, 4 debug.'),
        logger: z
          .custom<NonNullable<NonNullable<DevServerOptions['log']>['logger']>>(
            (value) =>
              typeof value === 'object' &&
              value !== null &&
              'level' in value &&
              typeof value.level === 'number' &&
              ['debug', 'info', 'warn', 'error', 'createSubLogger']
                // Reject partial loggers before they fail during server startup.
                .every((method) => typeof Reflect.get(value, method) === 'function'),
            {
              error:
                'Custom logger must implement level, debug, info, warn, error, and createSubLogger.',
            },
          )
          .optional()
          .describe('Custom logger used by the dev server.'),
      })
      .strict()
      .optional()
      .describe('CLI logging settings.'),
  })
  .passthrough()
  .describe('Resolved CLI dev-server options, including SPA template and API proxy settings.');
