import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { mergeConfig as mergeConfigVite } from 'vite';

import type { RuntimeEnv } from '@equinor/fusion-framework-cli/lib';

import { createDevServer, type CreateDevServerOptions, type ConsoleLogger } from './utils/index.js';

import { resolveProjectPackage } from './helpers/resolve-project-package.js';
import { resolvePortalManifest } from './helpers/resolve-portal-manifest.js';
import { resolvePortalConfig } from './helpers/resolve-portal-config.js';
import { loadViteConfig } from './helpers/load-vite-config.js';

/**
 * Options for serving a built portal.
 * @public
 */
export interface ServePortalOptions {
  /**
   * Path to the portal manifest file.
   */
  manifest?: string;
  /**
   * Path to the portal config file.
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
 * Serves a built portal using the dev server in preview mode.
 *
 * This function loads the portal manifest and Vite configuration to determine
 * the build output directory, then starts a dev server to serve the built
 * portal files in a production-like environment.
 *
 * @param options - Options for serving the portal including port, host, and logger.
 * @returns A promise that resolves with the dev server instance.
 * @throws Will throw if the build directory doesn't exist or if serving fails.
 * @public
 */
export const servePortal = async (options?: ServePortalOptions) => {
  const { log, dir: customDir, port = 4173, host = 'localhost' } = options ?? {};

  log?.log('Starting to serve portal');

  // Resolve the portal's package.json for root and metadata
  const pkg = await resolveProjectPackage(log);

  log?.start('Loading Vite config...');
  // Load Vite configuration to determine build output directory
  const viteConfig = await loadViteConfig(
    { root: pkg.root, command: 'build', mode: 'production' },
    pkg,
  );
  log?.succeed('Vite config loaded');

  // Determine the directory to serve (relative to root)
  const outDirRelative = customDir ? customDir : viteConfig.build?.outDir || 'dist';
  const outDirAbsolute = resolve(pkg.root, outDirRelative);

  // Setup the runtime environment for the serve server
  const env: RuntimeEnv = {
    root: pkg.root,
    environment: 'local',
    mode: 'production',
    command: 'serve',
    isPreview: true,
  };

  // Resolve the portal manifest using the environment and manifest path
  const portalManifest = await resolvePortalManifest(env, pkg, {
    log,
    manifestPath: options?.manifest,
  });

  // Resolve the portal config
  const portalConfig = await resolvePortalConfig(env, { log, config: options?.config });

  log?.debug('Output directory:', outDirAbsolute);

  // Check if the build directory exists
  if (!existsSync(outDirAbsolute)) {
    throw new Error(
      `Build directory does not exist: ${outDirAbsolute}\n` +
        'Please build the portal first using `ffc portal build`',
    );
  }

  // In preview mode, serve built files directly from Vite's root instead of
  // using the /@fs/ dev-only filesystem handler. Clear assetPath and prefix
  // templateEntry with '/' so the browser resolves it as an absolute URL path.
  portalManifest.build.assetPath = undefined;
  portalManifest.build.templateEntry = `/${portalManifest.build.templateEntry}`;

  const localViteConfig = await loadViteConfig(env, pkg);

  // Configure Vite server settings
  const viteConfigOverride = mergeConfigVite(localViteConfig, {
    server: {
      port,
      host: host || localViteConfig.server?.host || 'localhost',
      fs: {
        allow: [pkg.root, outDirAbsolute],
      },
    },
  });

  const devServerConfig: CreateDevServerOptions = {
    template: {
      portal: {
        id: portalManifest.name,
      },
    },
    portal: {
      manifest: portalManifest,
      config: portalConfig,
    },
  };

  log?.debug('vite config:', viteConfigOverride);
  log?.debug('dev server config:', devServerConfig);

  log?.start('Starting preview server...');

  try {
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

    return devServer;
  } catch (error) {
    log?.fail('Failed to start preview server');
    throw error;
  }
};
