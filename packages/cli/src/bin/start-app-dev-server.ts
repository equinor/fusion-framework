import { fileURLToPath } from 'node:url';

import { mergeConfig as mergeConfigVite } from 'vite';

import type { RuntimeEnv } from '@equinor/fusion-framework-cli/lib';

import { fileExistsSync } from '../lib/utils/file-exists-sync.js';

import { resolveAppConfig } from './helpers/resolve-app-config.js';
import { resolveProjectPackage } from './helpers/resolve-project-package.js';
import { resolveAppManifest } from './helpers/resolve-app-manifest.js';

import type { ConsoleLogger } from './utils/ConsoleLogger.js';
import { createDevServer } from './utils/create-dev-server.js';
import type { CreateDevServerOptions } from './utils/create-dev-server-config.js';

import { readPackageUp } from 'read-package-up';
import { dirname, isAbsolute, relative, resolve } from 'node:path';
import { octopusAppPlugin } from '@equinor/fusion-framework-vite-plugin-octopus';
import { loadViteConfig } from './helpers/load-vite-config.js';

/**
 * Finds the folder with the app's source, relative to the package root, from the manifest's
 * entry point, so Vite can scan it at startup.
 *
 * @param root - Package root.
 * @param entryPoint - Entry point from the app manifest, absolute or relative to the root.
 * @returns The folder, or `undefined` when it is outside the package.
 */
const resolveSourceDir = (root: string, entryPoint?: string): string | undefined => {
  if (!entryPoint) {
    return undefined;
  }
  const dir = relative(
    root,
    dirname(isAbsolute(entryPoint) ? entryPoint : resolve(root, entryPoint)),
  );
  return dir.startsWith('..') ? undefined : dir || '.';
};

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
  env?: Partial<RuntimeEnv>;
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

  /**
   * Host for the development server (optional, defaults to 'localhost').
   */
  host?: string;

  /**
   * Origin of a local mock server (e.g. `http://localhost:4010`) to use for API service
   * discovery instead of the default CI environment (optional).
   */
  mock?: string;

  /**
   * Octopus address (e.g. `http://localhost:2000`). When set, the app registers with Octopus
   * while the dev server runs, so a local portal loads it from here (optional).
   */
  octopus?: string;
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
  // Only wire up a dev-server template entry when the portal resolves to a local file
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

  const localViteConfig = await loadViteConfig(env, pkg);

  const allowFs = templateFilePath ? [pkg.root, templateFilePath] : [pkg.root];

  log?.debug(`File system access allowed for: \n${allowFs.join('\n')}\n`);

  const viteConfig = mergeConfigVite(localViteConfig, {
    server: {
      // With Octopus the portal finds the app wherever it runs, so take any free port rather
      // than 3000, which the portal itself uses.
      port: options?.port || (options?.octopus ? 0 : 3000),
      host: options?.host || localViteConfig.server?.host || 'localhost',
      fs: {
        allow: allowFs,
      },
    },
    plugins: options?.octopus
      ? [
          octopusAppPlugin({
            appKey: appManifest.appKey,
            octopusUrl: options.octopus,
            mockUrl: options.mock,
            sourceDir: resolveSourceDir(pkg.root, appManifest.build?.entryPoint),
          }),
        ]
      : [],
  });

  const devServerConfig: CreateDevServerOptions = {
    template: {
      portal: {
        id: portalId,
      },
    },
    app: {
      manifest: appManifest,
      config: appConfig,
    },
    mock: options?.mock,
  };
  // If a local portal entry point is found, add it to the config
  if (templateEntry) {
    devServerConfig.portal = {
      manifest: {
        name: portalId,
        build: {
          templateEntry,
          assetPath: '/@fs',
        },
      },
      config: {},
    };
  }

  log?.debug('vite config:', viteConfig);
  log?.debug('dev server config:', devServerConfig);

  log?.start('Starting app development server...');

  // Create the dev server configuration, including portal and app settings
  const devServer = await createDevServer(env, devServerConfig, { overrides: viteConfig, log });

  await devServer.listen();

  log?.succeed('App development server started successfully');
  // print the server URL for user convenience with `apps/<appKey>`; with Octopus the port is
  // picked at startup, so read it from the running server
  const protocol = devServer.config.server.https ? 'https' : 'http';
  const host = devServer.config.server.host || 'localhost';
  const address = devServer.httpServer?.address();
  const port =
    (typeof address === 'object' && address?.port) || devServer.config.server.port || 5173;
  log?.info(
    `App development server is running at: ${protocol}://${host}:${port}/apps/${appManifest.appKey}`,
  );
  if (options?.octopus) {
    log?.info(`Registering ${appManifest.appKey} with Octopus at ${options.octopus}`);
  }
  // Return the dev server instance for further use or testing
  return devServer;
};
