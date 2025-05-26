import { resolve } from 'node:path';

import type { RuntimeEnv } from '../lib';
import { createDevServerConfig, createDevServer, type ConsoleLogger } from './utils';

import { resolveAppPackage } from './helpers/resolve-project-package.js';

/**
 * Starts the portal development server for local development and testing.
 *
 * This function sets up the runtime environment, resolves the portal manifest and config,
 * and launches a development server using the resolved configuration. It provides detailed
 * logging for each step and returns the dev server instance for further use.
 *
 * @param options - Settings for environment, manifest path, config path, logger, and server options.
 * @returns The dev server instance after it has started.
 * @public
 */
export const startPortalDevServer = async (options?: {
  /**
   * Runtime environment settings for the dev server (optional).
   */
  env?: RuntimeEnv;
  /**
   * Path to the portal manifest file (optional).
   */
  manifest?: string;
  /**
   * Path to the portal config file (optional).
   */
  config?: string;
  /**
   * Logger instance for outputting progress and debug information (required).
   */
  log: ConsoleLogger | null;
  /**
   * Server options such as port (optional).
   */
  server?: {
    port?: number;
  };
}) => {
  const { log } = options ?? {};

  // The portalId is currently hardcoded, but could be made configurable in the future
  const portalId = '@equinor/fusion-framework-dev-portal';

  // Resolve the application's package.json for root and metadata
  const pkg = await resolveAppPackage(log);

  // Setup the runtime environment for the dev server
  const env: RuntimeEnv = {
    root: pkg.root,
    environment: 'local', // Always use 'local' for dev server
    ...options?.env, // Allow overrides from options
    mode: 'development', // Force development mode
    command: 'serve', // Command is always 'serve' for dev
  };

  // @todo - replace with resolvePortalManifest
  // Dummy implementation for resolving the portal manifest
  const resolvePortalManifest = async (...args: unknown[]) => {
    // Returns a dummy manifest for development; replace with real logic as needed
    return {
      id: 'dev-portal-dummy',
      build: {
        entrypoint: resolve(env.root || '', 'src/index.ts'),
        // if this is portal - portal-template-manifest
        template: {},
      },
    };
  };
  const portalManifest = await resolvePortalManifest();

  // Dummy implementation for resolving the portal config
  const resolvePortalConfig = async (...args: unknown[]) => ({ foo: 'bar' });

  // Resolve the portal config (replace with real logic as needed)
  const portalConfig = await resolvePortalConfig(env, { log, config: options?.config });

  log?.start('Starting app development server...');

  // Create the dev server configuration, including portal and server settings
  const devServer = await createDevServer(env, {
    template: {
      portal: {
        id: portalManifest.id,
      },
    },
    portal: {
      manifest: portalManifest,
      config: portalConfig,
    },
    server: {
      port: options?.server?.port,
    },
  });

  await devServer.listen();

  // Log the resolved local URL for the dev server
  log?.succeed(`Started app development server on ${devServer.resolvedUrls?.local?.[0]}`);

  // Return the dev server instance for further use
  return devServer;
};
