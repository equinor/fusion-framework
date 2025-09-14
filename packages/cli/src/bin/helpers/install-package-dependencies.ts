import { execa } from 'execa';
import type { ConsoleLogger } from '@equinor/fusion-framework-cli/bin';
import { assert } from '../../lib/utils/assert.js';

const SUPPORTED_PACKAGE_MANAGERS = ['npm', 'pnpm'];

/**
 * Install package dependencies using the specified package manager.
 *
 * @param targetDir - Directory to run package manager install in
 * @param packageManager - Package manager to use ('npm' or 'pnpm')
 * @param logger - Logger instance for output
 * @returns Promise resolving to the package manager name used
 */
export async function installPackageDependencies(
  targetDir: string,
  packageManager: string,
  logger?: ConsoleLogger,
): Promise<string> {
  // Check which package manager is used
  assert(
    SUPPORTED_PACKAGE_MANAGERS.includes(packageManager),
    'Package manager must be npm or pnpm',
  );

  logger?.start('Installing dependencies...');

  try {
    // execa handles signal cleanup automatically - no manual signal handling needed!
    await execa(packageManager, ['install'], {
      cwd: targetDir,
      stdio: 'inherit',
      shell: true,
    });

    logger?.succeed('Dependencies installed successfully!');
    return packageManager;
  } catch (error: any) {
    if (error.exitCode !== 0) {
      logger?.error(`${packageManager} install failed with exit code ${error.exitCode}`);
      throw new Error(`${packageManager} install failed with exit code ${error.exitCode}`);
    }
    logger?.error(`Failed to run ${packageManager} install: ${error.message}`);
    throw error;
  }
}

export default installPackageDependencies;
