import type { Plugin } from 'vite';

import { loadDevServerConfig, type RuntimeEnv } from '@equinor/fusion-framework-cli/lib';

import {
  createDevServer as createDevServerFn,
  type DevServerOptions,
  type UserConfig,
} from '@equinor/fusion-framework-dev-server';

import type { ConsoleLogger } from './ConsoleLogger.js';
import { normalizeDevServerConfig } from './normalize-dev-server-config.js';
import { createDevServerConfig, type CreateDevServerOptions } from './create-dev-server-config.js';
import { resolveMockAuthEndpoint } from './resolve-mock-auth-endpoint.js';

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
  // Mock auth enabled through the environment needs mock discovery too; `--mock` already covers both
  const mockDiscovery = options.mock
    ? undefined
    : resolveMockAuthEndpoint(
        env,
        typeof overrides?.envDir === 'string' ? overrides.envDir : undefined,
      );
  // Only log when the environment, not --mock, switched discovery to the mock server
  if (mockDiscovery) {
    log?.info(`FUSION_SPA_MSAL_MOCK is enabled, using mock service discovery at ${mockDiscovery}`);
  }
  const baseConfig = createDevServerConfig({
    ...options,
    mockDiscovery: options.mockDiscovery ?? mockDiscovery,
  });
  log?.debug('\nBase dev server config:', normalizeDevServerConfig(baseConfig));
  log?.debug('\nCreating dev server with overrides:', overrides);
  let config: DevServerOptions = baseConfig;
  let configWatcherPlugin: Plugin | undefined;
  try {
    const loaded = await loadDevServerConfig(env, baseConfig);
    config = loaded.config;
    const { path } = loaded;
    log?.debug(`\nLoaded dev server config from ${path}`);
    log?.debug('\nLoaded dev server config:', normalizeDevServerConfig(config));

    // Add plugin to watch the config file and restart on changes
    configWatcherPlugin = createDevServerConfigWatcherPlugin(path, log);
  } catch (error) {
    log?.warn(
      '\nFailed to load dev server config:',
      error instanceof Error ? error.message : String(error),
    );
  }

  const mergedOverrides = configWatcherPlugin
    ? {
        ...overrides,
        plugins: [...(overrides?.plugins ?? []), configWatcherPlugin],
      }
    : overrides;
  return createDevServerFn(config, mergedOverrides);
};
