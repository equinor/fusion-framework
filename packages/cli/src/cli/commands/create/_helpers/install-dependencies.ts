import inquirer from 'inquirer';
import type { ConsoleLogger } from '@equinor/fusion-framework-cli/bin';
import { installPackageDependencies } from '../../../../bin/helpers/install-package-dependencies.js';

/**
 * Prompt user to install dependencies and execute the installation.
 * Returns whether dependencies were actually installed and the package manager used.
 *
 * @param targetDir - Directory path where dependencies should be installed
 * @param logger - Logger instance for output
 * @returns Promise resolving to object with installed status and package manager
 */
export async function installDependencies(
  targetDir: string, 
  logger: ConsoleLogger
): Promise<{ installed: boolean; packageManager?: string }> {
  // Ask user if they want to install dependencies
  const { installDeps } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'installDeps',
      message: '📦 Install dependencies?',
      default: true,
    },
  ]);

  if (!installDeps) {
    logger.debug('Skipping dependency installation');
    return { installed: false };
  }

  // Check which package manager is used
  const { packageManager } = await inquirer.prompt([
    {
      type: 'list',
      name: 'packageManager',
      message: '📦 Which package manager do you want to use?',
      choices: ['pnpm', 'npm'],
      default: 'pnpm',
    },
  ]);

  await installPackageDependencies(targetDir, packageManager, logger);
  return { installed: true, packageManager };
}

export default installDependencies;
