import z from 'zod';
import { importConfig, type ImportConfigResult } from '@equinor/fusion-imports';

import type { RuntimeEnv } from '../types.js';
import type { PortalConfig, PortalConfigFn } from './portal-config.js';

/**
 * Represents the configuration export for a portal.
 *
 * This can either be a static configuration object (`PortalConfig`) or a function (`PortalConfigFn`)
 * that returns or modifies the portal configuration dynamically.
 *
 * Used for both static and dynamic portal config patterns.
 *
 * @remarks
 * - Enables flexible config authoring for different deployment scenarios.
 * - Supports both object and function-based portal configuration.
 *
 * @example <caption>Static export</caption>
 * ```ts
 * export default {
 *   environment: { name: 'production' },
 *   features: { enableBeta: true },
 * };
 * ```
 *
 * @example <caption>Dynamic export</caption>
 * ```ts
 * export default (env, { base }) => ({
 *   ...base,
 *   environment: { name: env.environment },
 *   features: { enableBeta: env.environment === 'dev' },
 * });
 * ```
 */
export type PortalConfigExport = PortalConfig | PortalConfigFn;

/**
 * Options for loading a portal config file.
 *
 * @property base - A base configuration object to merge with the imported configuration.
 * @property file - The name of the configuration file to import. Defaults to 'portal.config'.
 * @property extensions - An array of file extensions to consider when resolving the configuration file.
 * @property schema - An optional Zod schema for validating the loaded portal configuration.
 *
 * @remarks
 * - Allows for custom config file resolution and merging strategies.
 * - Useful for multi-environment setups and advanced config loading.
 * - Schema validation ensures type safety for portal configuration.
 *
 * @example
 * ```ts
 * const config = await loadPortalConfig(env, {
 *   file: 'custom-portal.config.ts',
 *   schema: z.object({ environment: z.object({ name: z.string() }) })
 * });
 * ```
 */
export type LoadPortalConfigOptions = {
  base?: PortalConfig; // Optional: base config to merge with imported config
  file?: string; // Optional: config filename or pattern
  extensions?: string[]; // Optional: allowed file extensions
  schema?: z.ZodSchema<PortalConfig>; // Optional: schema for validation
};

/**
 * Loads and resolves the portal configuration from a file or function export.
 *
 * This function uses a script resolver to handle dynamic imports. If the imported module's default export
 * is a function, it will be invoked with the base configuration and runtime environment. The result
 * is validated against the provided schema (or a permissive passthrough schema by default).
 *
 * @param env - The runtime environment containing the root directory and other environment-specific settings.
 * @param options - Optional parameters for configuring the import process.
 * @returns A promise that resolves to the imported and validated portal configuration.
 *
 * @remarks
 * - Supports both static and dynamic config authoring patterns for portals.
 * - Ensures all configs are validated against the schema for type safety.
 * - Designed for maintainability and RAG-based documentation extraction.
 *
 * @example
 * ```ts
 * const config = await loadPortalConfig(env, { file: 'custom-portal.config.ts' });
 * ```
 */
export const loadPortalConfig = <T extends PortalConfig = PortalConfig>(
  env: RuntimeEnv,
  options?: LoadPortalConfigOptions,
): Promise<ImportConfigResult<T>> => {
  // Suggest config filenames based on environment, fallback to default
  const suggestions = options?.file ?? [`portal.config.${env.environment}`, 'portal.config'];
  return importConfig(suggestions, {
    baseDir: env.root, // Set the base directory for config resolution
    extensions: options?.extensions, // Allow custom file extensions
    script: {
      // Custom resolver for the imported config module
      resolve: async (module: { default: PortalConfigExport }): Promise<T> => {
        // Use provided schema or a permissive passthrough schema by default
        const schema = options?.schema ?? z.object({}).passthrough();
        const base = options?.base ?? ({} as T); // Use provided base or default

        // If the module's default export is a function, invoke it with the base config and environment
        // and validate the result against the schema
        if (typeof module.default === 'function') {
          const result = (await module.default(base, env)) ?? base;
          return schema.parse(result) as T; // Validate and return
        }
        // If the module's default export is not a function, treat it as a configuration object
        // and validate it against the schema
        return schema.parse(module.default ?? base) as T; // Validate and return
      },
    },
  });
};
