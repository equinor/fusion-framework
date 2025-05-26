import { importConfig, type ImportConfigResult } from '@equinor/fusion-imports';

import { type ApiAppConfig, ApiAppConfigSchema } from './schemas.js';

import type { RuntimeEnv } from '../types.js';
import type { AppConfigFn } from './app-config.js';

/**
 * Represents the configuration export for an application.
 *
 * This can either be a static configuration object (`ApiAppConfig`) or a function (`AppConfigFn`)
 * that returns or modifies the application configuration dynamically.
 *
 * Used for both static and dynamic app config patterns.
 *
 * @remarks
 * - Enables flexible config authoring for different deployment scenarios.
 */
export type AppConfigExport = ApiAppConfig | AppConfigFn;

/**
 * Options for loading an application config file.
 *
 * @property base - A base configuration object to merge with the imported configuration.
 * @property file - The name of the configuration file to import. Defaults to 'app.config'.
 * @property extensions - An array of file extensions to consider when resolving the configuration file.
 *
 * @remarks
 * - Allows for custom config file resolution and merging strategies.
 * - Useful for multi-environment setups and advanced config loading.
 */
export type LoadAppConfigOptions = {
  base?: ApiAppConfig; // Optional: base config to merge with imported config
  file?: string; // Optional: config filename or pattern
  extensions?: string[]; // Optional: allowed file extensions
};

/**
 * Loads and resolves the application configuration from a file or function export.
 *
 * This function uses a script resolver to handle dynamic imports. If the imported module's default export
 * is a function, it will be invoked with the runtime environment and the base configuration. The result
 * is validated against the `ApiAppConfigSchema`. If the export is an object, it is validated directly.
 *
 * @param env - The runtime environment containing the root directory and other environment-specific settings.
 * @param options - Optional parameters for configuring the import process.
 * @returns A promise that resolves to the imported and validated application configuration.
 *
 * @remarks
 * - Supports both static and dynamic config authoring patterns.
 * - Ensures all configs are validated against the schema for type safety.
 * - Designed for maintainability and RAG-based documentation extraction.
 *
 * @example
 * ```ts
 * const config = await loadAppConfig(env, { file: 'custom.config.ts' });
 * ```
 */
export const loadAppConfig = (
  env: RuntimeEnv,
  options?: LoadAppConfigOptions,
): Promise<ImportConfigResult<ApiAppConfig>> => {
  // Suggest config filenames based on environment, fallback to default
  const suggestions = options?.file ?? [`app.config.${env.environment}`, 'app.config'];
  return importConfig(suggestions, {
    baseDir: env.root, // Set the base directory for config resolution
    extensions: options?.extensions, // Allow custom file extensions
    script: {
      // Custom resolver for the imported config module
      resolve: async (module: { default: AppConfigExport }): Promise<ApiAppConfig> => {
        const base: ApiAppConfig = options?.base ?? { environment: {} }; // Use provided base or default

        // If the module's default export is a function, invoke it with the environment and base config
        // and validate the result against the schema
        if (typeof module.default === 'function') {
          const result = (await module.default(env, { base })) ?? base;
          return ApiAppConfigSchema.parse(result ?? base); // Validate and return
        }
        // If the module's default export is not a function, treat it as a configuration object
        // and validate it against the schema
        return ApiAppConfigSchema.parse(module.default ?? base); // Validate and return
      },
    },
  });
};
