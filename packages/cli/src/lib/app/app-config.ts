import type z from 'zod';
import type { RuntimeEnv } from '../types';
import type { ApiAppConfig, ApiAppConfigSchema } from './schemas';

export type { ApiAppConfig as AppConfig } from './schemas.js';

export { mergeAppConfig } from './merge-app-config.js';

/**
 * A function type that defines the structure for configuring an application.
 *
 * This function receives the runtime environment and a base config, and returns
 * either a config object, a promise resolving to a config object, or void.
 *
 * @template env - The runtime environment in which the application is running.
 * @param env - The runtime environment object.
 * @param args - An object containing the base API application configuration.
 * @param args.base - The base configuration for the API application.
 * @returns A value or a promise resolving to a value that matches the input type of `ApiAppConfigSchema`,
 *          or `void` if no configuration is provided.
 */
export type AppConfigFn = (
  env: RuntimeEnv,
  args: { base: ApiAppConfig },
) => z.input<typeof ApiAppConfigSchema> | Promise<z.input<typeof ApiAppConfigSchema> | void> | void;

/**
 * Defines the application configuration by accepting a function that returns the configuration object.
 *
 * This utility is typically used to encapsulate and organize application-specific settings
 * in a structured and type-safe manner.
 *
 * @param fn - A function that returns the application configuration object.
 * @returns The result of invoking the provided configuration function.
 */
export const defineAppConfig = (fn: AppConfigFn) => fn;
