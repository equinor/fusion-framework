import { resolvePackage } from '@equinor/fusion-framework-cli/lib';

import type { ConsoleLogger } from '../utils/index.js';

import { chalk } from '../utils/format.js';

/**
 * Resolves the application package by fetching its metadata and logging relevant information.
 *
 * This function uses a logger to provide feedback during the resolution process.
 * It retrieves the package's packageJson and root directory, logs the results, and handles errors gracefully.
 *
 * @param log - Logger instance for progress and status updates.
 * @returns A promise that resolves to the package information, including its packageJson and root directory.
 * @throws Will throw an error if the package resolution fails.
 */
export async function resolveProjectPackage(log?: ConsoleLogger | null) {
  // Start the logging for package resolution
  log?.start('resolve project package');
  try {
    // Attempt to resolve the package (find package.json and root)
    const pkg = await resolvePackage();
    // Log success with package name and version
    log?.succeed(
      '📦',
      chalk.yellowBright([pkg.packageJson.name, pkg.packageJson.version].join('@')),
    );
    // Log the root directory of the package
    log?.info('🏠', chalk.blueBright(pkg.root));
    return pkg;
  } catch (error) {
    // Log failure if package resolution fails
    log?.fail('☠️', 'failed to resolve project package');
    throw error;
  }
}

export default resolveProjectPackage;
