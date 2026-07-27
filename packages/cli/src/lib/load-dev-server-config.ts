import { importConfig, type ImportConfigResult } from '@equinor/fusion-imports';
import type { RecursivePartial, RuntimeEnv } from './types.js';
import type { DevServerOptions } from '@equinor/fusion-framework-dev-server';
import { mergeDevServerConfig } from './merge-dev-server-config.js';
import type { DevServerConfigExport } from './define-dev-server-config.js';

/**
 * Loads the dev server configuration from a file or function.
 *
 * @param env - The runtime environment configuration.
 * @param base - The base DevServerOptions to use as defaults.
 * @param options - Optional settings for file name and extensions.
 * @returns A promise resolving to the imported config result.
 *
 * This function uses importConfig to dynamically load the configuration file.
 * If the config export is a function, it is invoked with the environment and a cloned base config.
 * If the config export is an object, it is merged with the base config.
 *
 * Inline comments are provided for maintainability and clarity.
 */
export const loadDevServerConfig = async (
  env: RuntimeEnv,
  base: DevServerOptions,
  options?: {
    file?: string;
    extensions?: string[];
  },
): Promise<ImportConfigResult<DevServerOptions>> => {
  // Use importConfig to load the config file, defaulting to 'dev-server.config' if not specified
  return importConfig(options?.file ?? 'dev-server.config', {
    baseDir: env.root, // Set the base directory for config resolution
    extensions: options?.extensions, // Allow custom file extensions
    script: {
      // Custom resolver for the config module
      resolve: async (module: { default: DevServerConfigExport }): Promise<DevServerOptions> => {
        // If the default export is a function, call it with env and a cloned base config
        let overrides: RecursivePartial<DevServerOptions> | undefined;
        // Config files may export either a factory function or a plain overrides object
        if (typeof module.default === 'function') {
          const baseClone = { ...base }; // Clone base to avoid mutation
          overrides = await module.default(env, { base: baseClone });
          // TODO: Add zod validation of the config for type safety
        } else {
          overrides = module.default as RecursivePartial<DevServerOptions>;
        }
        // If the default export is an object, return it or fallback to base
        return mergeDevServerConfig(base, overrides ?? {});
      },
    },
  });
};
