import { z } from 'zod';

import type { DevServerOptions } from '@equinor/fusion-framework-dev-server';

type ConfiguredRoute = NonNullable<DevServerOptions['api']['routes']>[number];
type TemplateEnvironment = NonNullable<NonNullable<DevServerOptions['spa']>['templateEnv']>;

const routeMatchSchema = z.custom<ConfiguredRoute['match']>(
  (value) =>
    typeof value === 'string' ||
    typeof value === 'function' ||
    (Array.isArray(value) && value.every((item) => typeof item === 'string')),
);

const routeSchema = z.union([
  z
    .object({
      match: routeMatchSchema,
      middleware: z.custom<NonNullable<ConfiguredRoute['middleware']>>(
        (value) => typeof value === 'function',
      ),
      proxy: z.undefined().optional(),
    })
    .strict(),
  z
    .object({
      match: routeMatchSchema,
      middleware: z.undefined().optional(),
      proxy: z.object({ target: z.string().min(1) }).passthrough(),
    })
    .strict(),
]);

const templateEnvironmentObjectSchema = z
  .object({
    title: z.string().optional(),
    bootstrap: z.string().optional(),
    telemetry: z
      .object({
        consoleLevel: z.number().optional(),
      })
      .strict()
      .optional(),
    portal: z
      .object({
        id: z.string().min(1),
        tag: z.string().optional(),
        proxy: z.boolean().optional(),
      })
      .strict()
      .optional(),
    serviceDiscovery: z
      .object({
        url: z.string().min(1),
        scopes: z.array(z.string()),
      })
      .strict()
      .optional(),
    msal: z
      .object({
        tenantId: z.string(),
        clientId: z.string(),
        redirectUri: z.string(),
        requiresAuth: z.string(),
        mock: z.union([z.string(), z.boolean()]).optional(),
        mockServerUrl: z.string().optional(),
      })
      .strict()
      .optional(),
    serviceWorker: z
      .object({
        resources: z.array(
          z
            .object({
              url: z.string().min(1),
              scopes: z.array(z.string()).optional(),
              rewrite: z.string().optional(),
            })
            .strict(),
        ),
      })
      .strict()
      .optional(),
  })
  .strict();

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
        templateEnv: z.union([
          templateEnvironmentObjectSchema,
          z.custom<TemplateEnvironment>((value) => typeof value === 'function'),
        ]),
      })
      .strict()
      .optional(),
    api: z
      .object({
        serviceDiscoveryUrl: z.string().min(1),
        processServices: z
          .custom<NonNullable<DevServerOptions['api']['processServices']>>(
            (value) => typeof value === 'function',
          )
          .optional(),
        routes: z.array(routeSchema).optional(),
        headers: z.record(z.string(), z.string()).optional(),
      })
      .strict(),
    log: z
      .object({
        level: z.number().optional(),
        logger: z
          .custom<NonNullable<NonNullable<DevServerOptions['log']>['logger']>>(
            (value) =>
              typeof value === 'object' &&
              value !== null &&
              'level' in value &&
              typeof value.level === 'number' &&
              ['debug', 'info', 'warn', 'error', 'createSubLogger'].every(
                (method) => typeof Reflect.get(value, method) === 'function',
              ),
          )
          .optional(),
      })
      .strict()
      .optional(),
  })
  .strict();
