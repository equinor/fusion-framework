import { spawn } from 'node:child_process';
import inquirer from 'inquirer';
import type { ConsoleLogger } from '@equinor/fusion-framework-cli/bin';

/**
 * Prompt user to start the development server and execute the command.
 *
 * @param targetDir - Directory path where the dev server should be started
 * @param packageManager - Package manager to use for running the dev command
 * @param logger - Logger instance for output
 * @returns Promise resolving to true if dev server was started, false if skipped
 */
export async function startDevServer(
  targetDir: string,
  packageManager: string,
  logger: ConsoleLogger,
): Promise<boolean> {
  const { startDev } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'startDev',
      message: '🚀 Start development server?',
      default: true,
    },
  ]);

  if (startDev) {
    logger.debug(`Starting development server: ${targetDir}`);
    spawn(packageManager, ['run', 'dev'], {
      cwd: targetDir,
      stdio: 'inherit',
      shell: true,
    });
    return true;
  }

  return false;
}

export default startDevServer;
