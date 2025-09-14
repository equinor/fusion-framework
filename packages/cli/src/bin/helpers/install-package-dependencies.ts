import { spawn } from 'node:child_process';
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
  logger?: ConsoleLogger
): Promise<string> {
  // Check which package manager is used
  assert(SUPPORTED_PACKAGE_MANAGERS.includes(packageManager), 'Package manager must be npm or pnpm');

  return new Promise((resolve, reject) => {
    logger?.start('Installing dependencies...');

    const child = spawn(packageManager, ['install'], {
      cwd: targetDir,
      stdio: 'inherit',
      shell: true,
    });

    child.on('close', (code) => {
      if (code === 0) {
        logger?.succeed('Dependencies installed successfully!');
        resolve(packageManager);
      } else {
        logger?.error(`${packageManager} install failed with exit code ${code}`);
        reject(new Error(`${packageManager} install failed with exit code ${code}`));
      }
    });

    child.on('error', (error) => {
      logger?.error(`Failed to run ${packageManager} install: ${error.message}`);
      reject(error);
    });
  });
}

export default installPackageDependencies;
