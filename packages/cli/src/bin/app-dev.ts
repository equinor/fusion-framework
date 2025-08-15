import { fileURLToPath } from 'node:url';

import type { RuntimeEnv } from '@equinor/fusion-framework-cli/lib';

import { fileExistsSync } from '../lib/utils/file-exists.js';

import { resolveAppConfig } from './helpers/resolve-app-config.js';
import { resolveProjectPackage } from './helpers/resolve-project-package.js';
import { resolveAppManifest } from './helpers/resolve-app-manifest.js';

import type { ConsoleLogger } from './utils/ConsoleLogger.js';
import { createDevServer } from './utils/create-dev-server.js';

import { readPackageUp } from 'read-package-up';
import { dirname } from 'node:path';

/**
 * Options for starting the application development server.
 *
 * This interface defines the shape of the options object accepted by
 * {@link startAppDevServer}. It allows for optional environment, manifest path,
 * config path, and logger.
 *
 * @public
 */
export interface StartAppDevServerOptions {
  /**
   * Runtime environment settings for the dev server (optional).
   */
  env?: RuntimeEnv;
  /**
   * Path to the application manifest file (optional).
   */
  manifest?: string;
  /**
   * Path to the application config file (optional).
   */
  config?: string;
  /**
   * Logger instance for outputting progress and debug information (required).
   */
  log: ConsoleLogger | null;

  /**
   * Port for the development server (optional, defaults to 3000).
   */
  port?: number;
}

/**
 * Starts the application development server for local development.
 *
 * This function resolves the app package, manifest, and config, sets up the runtime environment,
 * and launches a development server using the resolved configuration. It also attempts to resolve
 * the portal entry point if available, and provides detailed logging for each step.
 *
 * @param options - Settings for environment, manifest path, config path, and logger.
 * @returns A promise that resolves when the dev server has started.
 * @public
 */
export const startAppDevServer = async (options?: StartAppDevServerOptions) => {
  const { log } = options ?? {};

  // The portalId is currently hardcoded, but could be made configurable in the future
  const portalId = '@equinor/fusion-framework-dev-portal';

  // Resolve the application's package.json for root and metadata
  const pkg = await resolveProjectPackage(log);

  // Setup the runtime environment for the dev server
  const env: RuntimeEnv = {
    root: pkg.root,
    environment: 'local', // Always use 'local' for dev server
    ...options?.env, // Allow overrides from options
    mode: 'development', // Force development mode
    command: 'serve', // Command is always 'serve' for dev
  };

  // Resolve the application manifest using the environment and manifest path
  const appManifest = await resolveAppManifest(env, pkg, {
    log,
    manifestPath: options?.manifest,
  });

  // Resolve the application config using the environment and config path
  const appConfig = await resolveAppConfig(env, { log, config: options?.config });

  // Attempt to resolve the portal entry point if the portal is local
  let templateEntry: string | undefined;
  let templateFilePath: string | undefined;
  const portalFilePath = fileURLToPath(import.meta.resolve(portalId));
  if (fileExistsSync(portalFilePath)) {
    // If the portal file exists locally, set the entry point for the dev server
    templateEntry = portalFilePath;
    // Resolve the directory of the portal file for potential asset paths
    templateFilePath = await readPackageUp({ cwd: portalFilePath }).then((x) =>
      x ? dirname(x?.path) : undefined,
    );
  } else {
    // Otherwise, log that the portal is external and skip entry point resolution
    log?.info(`Portal ${portalId} is external, skipping entry point resolution`);
  }

  log?.start('Starting app development server...');

  // Create the dev server configuration, including portal and app settings
  const devServer = await createDevServer(
    env,
    {
      template: {
        portal: {
          id: portalId,
        },
      },
      // If a local portal entry point is found, add it to the config
      ...(templateEntry
        ? {
            portal: {
              manifest: {
                name: portalId,
                build: {
                  templateEntry,
                  assetPath: '/@fs',
                },
              },
              // @todo - replace with real portal config when available
              config: {},
            },
          }
        : {}),
      app: {
        manifest: appManifest,
        config: appConfig,
      },
    },
    {
      server: {
        port: options?.port || 3000,
        host: 'localhost',
        fs: {
          allow: templateFilePath ? [pkg.root, templateFilePath] : [pkg.root],
        },
      },
    },
  );

  await devServer.listen();

  log?.succeed('App development server started successfully');
  // print the server URL for user convenience with `apps/<appKey>`
  const protocol = devServer.config.server.https ? 'https' : 'http';
  const host = devServer.config.server.host || 'localhost';
  const port = devServer.config.server.port || 5173;
  log?.info(
    `App development server is running at: ${protocol}://${host}:${port}/apps/${appManifest.appKey}`,
  );
  // Return the dev server instance for further use or testing
  return devServer;
};
