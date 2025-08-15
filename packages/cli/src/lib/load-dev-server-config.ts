import { importConfig, type ImportConfigResult } from '@equinor/fusion-imports';
import type { RecursivePartial, RuntimeEnv } from './types.js';
import type { DevServerOptions } from '@equinor/fusion-framework-dev-server';
import { mergeDevServerConfig } from './merge-dev-server-config.js';

/**
 * Type definition for a function that generates or modifies DevServerOptions.
 * @param env - The runtime environment configuration.
 * @param args - An object containing the base DevServerOptions.
 * @returns A DevServerOptions object or a Promise resolving to one, or undefined.
 */
export type DevServerConfigFn = (
  env: RuntimeEnv,
  args: { base: DevServerOptions },
) =>
  | Promise<RecursivePartial<DevServerOptions> | undefined>
  | RecursivePartial<DevServerOptions>
  | undefined;

/**
 * Type definition for a dev server config export, which can be either a DevServerOptions object or a function.
 */
export type DevServerConfigExport = DevServerOptions | DevServerConfigFn;

/**
 * Helper to define a dev server config function with proper typing.
 * @param fn - The configuration function to be used as the dev server config.
 * @returns The same function, typed as DevServerConfigFn.
 */
export const defineDevServerConfig = (fn: DevServerConfigFn) => fn;

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
