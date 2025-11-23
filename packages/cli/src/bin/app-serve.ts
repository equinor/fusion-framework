import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { mergeConfig as mergeConfigVite } from 'vite';
import { readPackageUp } from 'read-package-up';

import type { RuntimeEnv } from '@equinor/fusion-framework-cli/lib';

import { fileExistsSync } from '../lib/utils/file-exists.js';

import type { ConsoleLogger } from './utils/index.js';
import { createDevServer, type CreateDevServerOptions } from './utils/create-dev-server.js';

import { resolveAppConfig } from './helpers/resolve-app-config.js';
import { resolveProjectPackage } from './helpers/resolve-project-package.js';
import { resolveAppManifest } from './helpers/resolve-app-manifest.js';
import { loadViteConfig } from './helpers/load-vite-config.js';

/**
 * Options for serving a built application.
 * @public
 */
export interface ServeApplicationOptions {
  /**
   * Path to the application manifest file.
   */
  manifest?: string;
  /**
   * Path to the application config file.
   */
  config?: string;
  /**
   * Directory to serve (optional, will detect from build config if not provided).
   */
  dir?: string;
  /**
   * Port for the preview server (optional, defaults to 4173).
   */
  port?: number;
  /**
   * Host for the preview server (optional, defaults to 'localhost').
   */
  host?: string;
  /**
   * Logger instance for outputting progress and debug information (optional).
   */
  log?: ConsoleLogger | null;
  /**
   * Enable debug mode for verbose logging.
   */
  debug?: boolean;
}

/**
 * Serves a built application using the dev-portal.
 *
 * This function loads the application manifest and Vite configuration to determine
 * the build output directory, then starts a dev server with the portal to serve
 * the built files in a production-like environment.
 *
 * @param options - Options for serving the application including port, host, and logger.
 * @returns A promise that resolves when the preview server has started.
 * @throws Will throw if the build directory doesn't exist or if serving fails.
 * @public
 */
export const serveApplication = async (options?: ServeApplicationOptions) => {
  const { log, dir: customDir, port = 4173, host = 'localhost' } = options ?? {};

  log?.log('Starting to serve application');

  // The portalId is currently hardcoded, but could be made configurable in the future
  const portalId = '@equinor/fusion-framework-dev-portal';

  // Resolve the application's package.json for root and metadata
  const pkg = await resolveProjectPackage(log);

  log?.start('Loading Vite config...');
  // Load Vite configuration to determine build output directory and file name
  const viteConfig = await loadViteConfig(
    { root: pkg.root, command: 'build', mode: 'production' },
    pkg,
  );
  log?.succeed('Vite config loaded');

  // Determine the directory to serve (relative to root)
  const outDirRelative = customDir
    ? customDir
    : viteConfig.build?.outDir || 'dist';
  const outDirAbsolute = resolve(pkg.root, outDirRelative);

  // Setup the runtime environment for the serve server
  // Set isPreview: true so manifest uses compiled entry point
  const env: RuntimeEnv = {
    root: pkg.root,
    environment: 'local', // Always use 'local' for serve server
    mode: 'production', // Use production mode for built files
    command: 'serve', // Command is 'serve' for preview
    isPreview: true, // Mark as preview so manifest uses compiled entry point
  };

  // Resolve the application manifest using the environment and manifest path
  const appManifest = await resolveAppManifest(env, pkg, {
    log,
    manifestPath: options?.manifest,
  });

  // Resolve the application config using the environment and config path
  const appConfig = await resolveAppConfig(env, { log, config: options?.config });

  log?.debug('Output directory:', outDirAbsolute);

  // Check if the build directory exists
  if (!existsSync(outDirAbsolute)) {
    throw new Error(
      `Build directory does not exist: ${outDirAbsolute}\n` +
        'Please build the application first using `ffc app build`',
    );
  }

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

  const localViteConfig = await loadViteConfig(env, pkg);

  const allowFs = templateFilePath ? [pkg.root, templateFilePath, outDirAbsolute] : [pkg.root, outDirAbsolute];

  log?.debug(`File system access allowed for: \n${allowFs.join('\n')}\n`);

  // Configure Vite server settings
  const viteConfigOverride = mergeConfigVite(localViteConfig, {
    server: {
      port,
      host: host || localViteConfig.server?.host || 'localhost',
      fs: {
        allow: allowFs,
      },
    },
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

  log?.debug('vite config:', viteConfigOverride);
  log?.debug('dev server config:', devServerConfig);

  log?.start('Starting preview server with dev-portal...');

  try {
    // Create the dev server configuration, including portal and app settings
    // This will serve the built app through the dev-portal
    const devServer = await createDevServer(env, devServerConfig, {
      overrides: viteConfigOverride,
      log,
    });

    await devServer.listen();

    log?.succeed('Preview server started successfully');
    const protocol = devServer.config.server?.https ? 'https' : 'http';
    const serverHost = devServer.config.server?.host || host;
    const serverPort = devServer.config.server?.port || port;
    log?.info(`Preview server is running at: ${protocol}://${serverHost}:${serverPort}`);

    // Print app URL if manifest has appKey
    if (appManifest.appKey) {
      log?.info(
        `App URL: ${protocol}://${serverHost}:${serverPort}/apps/${appManifest.appKey}`,
      );
    }

    return devServer;
  } catch (error) {
    log?.fail('Failed to start preview server');
    throw error;
  }
};

// Export as default for compatibility with import patterns
export default serveApplication;

