import { FileNotFoundError } from '@equinor/fusion-imports';

import type { RuntimeEnv } from '@equinor/fusion-framework-cli/lib';
import { loadAppConfig, type ApiAppConfig } from '@equinor/fusion-framework-cli/app';

import type { ConsoleLogger } from '../utils/ConsoleLogger.js';
import { chalk, formatPath } from '../utils/format.js';

/**
 * Resolves the application configuration based on the provided runtime environment and options.
 * Handles logging, error reporting, and fallback to built-in config if no local config is found.
 *
 * @param env - The runtime environment containing the command and mode information.
 * @param options - Optional parameters:
 *   - config: Path to a specific configuration file.
 *   - log: Logger utility for progress and status messages.
 * @returns A promise resolving to the loaded application configuration.
 * @throws If the application configuration cannot be resolved.
 */
export const resolveAppConfig = async (
  env: RuntimeEnv,
  options: { config?: string; log?: ConsoleLogger | null },
): Promise<ApiAppConfig> => {
  const { log } = options;
  try {
    // Start logging the config creation process
    log?.start('create application configuration');
    log?.info(
      `generating config with ${chalk.red.dim(env.command)} command in ${chalk.green.dim(env.mode)} mode`,
    );
    // Attempt to load the application config (from file if specified)
    const result = await loadAppConfig(env, { file: options?.config });
    // Log success and show the config file path
    log?.succeed('⚙️ generated config from ', formatPath(result.path, { relative: true }));
    return result.config;
  } catch (err) {
    // Handle missing config file error
    if (err instanceof FileNotFoundError) {
      if (options.config) {
        // Warn if a specific config file was requested but not found
        log?.warn(
          `failed to load config file ${formatPath(options.config)}, please check the path.`,
        );
      } else {
        // Fallback to built-in config if no local config is present
        log?.succeed(chalk.dim('⚙️ no local application config applied, using built-in'));
        return { environment: {} };
      }
    }
    // Log failure and debug information for other errors
    log?.fail('failed to resolve application config');
    log?.debug(err);
    throw err;
  }
};
