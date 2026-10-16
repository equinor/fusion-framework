import type { Plugin } from 'vite';

import { loadDevServerConfig, type RuntimeEnv } from '@equinor/fusion-framework-cli/lib';
import { FileNotFoundError } from '@equinor/fusion-imports';

import {
  createDevServer as createDevServerFn,
  type DevServerOptions,
  type UserConfig,
} from '@equinor/fusion-framework-dev-server';
import { InvalidDevServerConfigError } from '../../lib/InvalidDevServerConfigError.js';
import { validateDevServerConfig } from '../../lib/validate-dev-server-config.js';

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

/**
 * Creates the CLI dev server from the default configuration merged with `dev-server.config`.
 *
 * A missing `dev-server.config` falls back to the validated defaults. A config file that cannot
 * be loaded, or that resolves to invalid options, is logged and stops startup.
 *
 * @param env - Runtime environment used to locate and evaluate `dev-server.config`.
 * @param options - App, portal, and mock settings used to build the default configuration.
 * @param args - Optional Vite overrides and logger.
 * @returns The created dev server.
 * @throws {InvalidDevServerConfigError} When the resolved configuration fails validation.
 * @throws {Error} When `dev-server.config` exists but cannot be loaded, or mock auth targets real discovery.
 */
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
    config = validateDevServerConfig(config);
    const loaded = await loadDevServerConfig(env, baseConfig);
    config = loaded.config;
    const { path } = loaded;
    log?.debug(`\nLoaded dev server config from ${path}`);
    log?.debug('\nLoaded dev server config:', normalizeDevServerConfig(config));

    // Add plugin to watch the config file and restart on changes
    configWatcherPlugin = createDevServerConfigWatcherPlugin(path, log);
  } catch (error) {
    // A project without dev-server.config is valid and runs on the validated defaults.
    if (error instanceof FileNotFoundError) {
      log?.debug('\nNo dev server config found, using defaults');
    } else {
      // Broken or invalid config must stop startup rather than run on success-shaped defaults.
      log?.error(
        InvalidDevServerConfigError.is(error)
          ? error.message
          : `Failed to load dev server config: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  // In mock mode every token is a mock token, so discovery must stay on the mock server even if
  // dev-server.config overrides it
  const discoveryMock = options.mock ?? options.mockDiscovery ?? mockDiscovery;
  // Fail at startup instead of sending mock tokens to real service discovery
  if (
    discoveryMock &&
    new URL(config.api.serviceDiscoveryUrl).origin !== new URL(discoveryMock).origin
  ) {
    throw new Error(
      `Mock mode is enabled (${discoveryMock}), but service discovery points at ${config.api.serviceDiscoveryUrl}. Remove the api.serviceDiscoveryUrl override from dev-server.config, or run without mock auth.`,
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
