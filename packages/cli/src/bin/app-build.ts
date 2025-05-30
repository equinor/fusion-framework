import { build as viteBuild } from 'vite';

import chalk from 'chalk';

import type { ReadResult as PackageInfo } from 'read-package-up';

import type { AppManifest } from '@equinor/fusion-framework-module-app';

import type { ConsoleLogger } from './utils';

import type { RuntimeEnv } from '../lib';

import { loadViteConfig } from './helpers/load-vite-config.js';

import loadAppManifest from './app-manifest';

/**
 * Options for building an application.
 * @public
 */
export type BuildApplicationOptions = {
  /**
   * Partial runtime environment variables to override defaults.
   */
  env?: Partial<RuntimeEnv>;
  /**
   * Path to the application manifest file.
   */
  manifest?: string;
  /**
   * Logger instance for build output. If null, disables logging.
   */
  log?: ConsoleLogger | null;
};

/**
 * Output of the application build process.
 * @public
 */
type ApplicationBuildOutput = {
  /**
   * Package information from package.json.
   */
  pkg: PackageInfo;
  /**
   * Application manifest object.
   */
  manifest: AppManifest;
  /**
   * Output directory for the built application.
   */
  outDir: string;
};

/**
 * Builds an application using Vite.
 *
 * Loads the application manifest, applies Vite configuration, and runs the Vite build process.
 *
 * @param opt - Build options including environment, manifest path, and logger.
 * @returns Output containing package info, manifest, and output directory.
 * @throws Will throw if the build process fails.
 * @public
 */
export const buildApplication = async (
  opt?: BuildApplicationOptions,
): Promise<ApplicationBuildOutput> => {
  const { log } = opt ?? {};

  log?.log(chalk.bold('Starting to build application'));

  // Load application manifest, package info, and environment variables
  const { manifest, pkg, env } = await loadAppManifest({ log, manifest: opt?.manifest });

  log?.start('loading vite config...');
  // Load local Vite configuration for the build
  const viteConfig = await loadViteConfig(env, pkg);
  log?.succeed('vite config applied');
  log?.debug('vite config:', viteConfig);

  log?.start('🤞🏻', 'building application...');
  log?.startNativeConsoleCapture();
  await viteBuild(viteConfig);
  log?.stopNativeConsoleCapture();
  log?.succeed('build completed 😘');

  // Output directory for the built application
  const outDir = viteConfig.build.outDir;

  return { pkg, manifest, outDir };
};
