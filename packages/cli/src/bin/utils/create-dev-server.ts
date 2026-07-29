import type { Plugin } from 'vite';

import { loadDevServerConfig, type RuntimeEnv } from '@equinor/fusion-framework-cli/lib';

import {
  createDevServer as createDevServerFn,
  type UserConfig,
} from '@equinor/fusion-framework-dev-server';

import type { ConsoleLogger } from './ConsoleLogger.js';
import { normalizeDevServerConfig } from './normalize-dev-server-config.js';
import { createDevServerConfig, type CreateDevServerOptions } from './create-dev-server-config.js';

/**
 * Creates a Vite plugin that watches the dev-server.config.ts file and restarts the server when it changes.
 */
const createDevServerConfigWatcherPlugin = (
  configFilePath: string,
  log?: ConsoleLogger | null,
): Plugin => {
  return {
    name: 'fusion:dev-server-config-watcher',
    configureServer(server) {
      // Watch the dev-server.config.ts file
      server.watcher.add(configFilePath);

      // Handle file changes
      server.watcher.on('change', (file) => {
        // Only restart when the watched config file itself changed
        if (file === configFilePath) {
          log?.info(`\n${configFilePath} changed, restarting dev server...`);
          // Restart the server to reload the config
          server.restart();
        }
      });

      log?.debug(`Watching dev-server.config.ts at: ${configFilePath}`);
    },
  };
};

export const createDevServer = async (
  env: RuntimeEnv,
  options: CreateDevServerOptions,
  args?: {
    overrides?: UserConfig;
    log?: ConsoleLogger | null;
  },
) => {
  const { overrides, log } = args ?? {};
  const baseConfig = createDevServerConfig(options);
  log?.debug('\nBase dev server config:', normalizeDevServerConfig(baseConfig));
  log?.debug('\nCreating dev server with overrides:', overrides);
  try {
    const { path, config } = await loadDevServerConfig(env, baseConfig);
    log?.debug(`\nLoaded dev server config from ${path}`);
    log?.debug('\nLoaded dev server config:', normalizeDevServerConfig(config));

    // Add plugin to watch the config file and restart on changes
    const configWatcherPlugin = createDevServerConfigWatcherPlugin(path, log);
    const mergedOverrides = {
      ...overrides,
      plugins: [...(overrides?.plugins ?? []), configWatcherPlugin],
    };

    return createDevServerFn(config, mergedOverrides);
  } catch (error) {
    log?.warn(
      '\nFailed to load dev server config:',
      error instanceof Error ? error.message : String(error),
    );
    return createDevServerFn(baseConfig, overrides);
  }
};
