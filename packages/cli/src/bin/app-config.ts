import type { RuntimeEnv } from '../lib/index.js';
import { writeFile } from '../lib/utils/index.js';

import { formatPath, type ConsoleLogger } from './utils/index.js';

import { resolveProjectPackage } from './helpers/resolve-project-package.js';
import { resolveAppConfig } from './helpers/resolve-app-config.js';
import {
  initializeFramework,
  type FusionEnv,
  type FusionFrameworkSettings,
} from './framework.node.js';

/**
 * Options for generating the application configuration.
 *
 * This interface defines the shape of the options object accepted by
 * {@link generateApplicationConfig}. It allows for optional logging, environment overrides,
 * config file path, and output file path.
 *
 * @public
 */
interface GenerateApplicationConfigOptions {
  /**
   * Logger instance for outputting progress and debug information (optional).
   */
  log?: ConsoleLogger | null;
  /**
   * Partial runtime environment overrides (optional).
   */
  env?: Partial<RuntimeEnv>;
  /**
   * Path to the config file to resolve (optional).
   */
  config?: string;
  /**
   * Output file path for writing the generated config (optional).
   */
  output?: string;
}

/**
 * Generates the application configuration object for the current project.
 *
 * This function resolves the app package, sets up the runtime environment, resolves the app config,
 * and optionally writes the config to a file if an output path is provided. Logging is supported for
 * debugging and progress tracking.
 *
 * @param options - Optional settings for logger, environment overrides, config path, and output file.
 * @returns An object containing the generated config and the resolved package info.
 * @throws If writing the config to file fails.
 * @public
 */
export const generateApplicationConfig = async (options?: GenerateApplicationConfigOptions) => {
  const { log } = options ?? {};
  // Resolve the application's package.json for root and metadata
  const pkg = await resolveProjectPackage(log);

  // Setup the runtime environment for config resolution
  const env: RuntimeEnv = {
    command: 'build',
    mode: process.env.NODE_ENV ?? 'production',
    root: pkg.root,
    ...options?.env, // Allow overrides from options
  };

  // Resolve the application config using the environment and config path
  const config = await resolveAppConfig(env, { log, config: options?.config });
  log?.debug('config:', config);

  // If an output path is provided, write the config to file
  if (options?.output) {
    log?.start('writing config to file');
    try {
      // Write the config as pretty-printed JSON
      await writeFile(options.output, JSON.stringify(config, null, 2));
      log?.succeed('config written successfully', formatPath(options.output, { relative: true }));
    } catch (error) {
      // Log and rethrow errors encountered during file write
      log?.fail('failed to write config');
      throw error;
    }
  }

  // Return the generated config and resolved package info for further use
  return { config, pkg };
};
