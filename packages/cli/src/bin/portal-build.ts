import { build as viteBuild } from 'vite';

import {
  initializeFramework,
  type FusionEnv,
  type FusionFrameworkSettings,
} from './framework.node.js';
import { type ConsoleLogger, chalk } from './utils/index.js';

import { loadViteConfig } from './helpers/load-vite-config.js';

import { loadPortalManifest } from './portal-manifest.js';

/**
 * Options for building a portal application using Vite.
 *
 * This type defines the optional parameters for the {@link buildPortal} function, including
 * environment overrides, manifest path, and logger instance.
 *
 * @property env - Partial runtime environment overrides (optional).
 * @property manifest - Path to the portal manifest file (optional).
 * @property log - Logger instance for outputting progress and debug information (optional).
 *
 * @public
 */
export type BuildApplicationOptions = {
  env?: Partial<FusionEnv>;
  manifest?: string;
  log?: ConsoleLogger | null;
};

/**
 * Builds a portal application using Vite.
 *
 * This function loads the portal manifest, applies Vite configuration, and runs the Vite build process.
 * It provides detailed logging for each step and returns the package info, manifest, and output directory.
 *
 * @param opt - Build options including environment, manifest path, and logger.
 * @returns An object containing the package info, manifest, and output directory.
 * @throws If the build process fails or configuration is invalid.
 * @public
 */
export const buildPortal = async (opt?: BuildApplicationOptions) => {
  const { log } = opt ?? {};

  // Log the start of the portal build process
  log?.log(chalk.bold('Starting to build portal'));

  // Load the portal manifest, package info, and environment variables
  const { manifest, pkg, env } = await loadPortalManifest({ log, manifest: opt?.manifest });

  log?.start('loading vite config...');
  // Load local Vite configuration for the build
  const viteConfig = await loadViteConfig(env, pkg);
  log?.succeed('vite config applied');
  log?.debug('vite config:', viteConfig);

  log?.start('🤞🏻', 'building portal...');
  // Capture native console output during the build
  log?.startNativeConsoleCapture();
  await viteBuild(viteConfig);
  log?.stopNativeConsoleCapture();
  log?.succeed('build completed 😘');

  // Output directory for the built portal
  const outDir = viteConfig.build.outDir;

  // Return the package info, manifest, and output directory for further use
  return { pkg, manifest, outDir };
};

// Export as default for compatibility with import patterns
export default buildPortal;
