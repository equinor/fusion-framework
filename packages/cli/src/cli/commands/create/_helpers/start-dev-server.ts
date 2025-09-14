import { execa } from 'execa';
import inquirer from 'inquirer';
import type { ConsoleLogger } from '@equinor/fusion-framework-cli/bin';

/**
 * Prompts the user to start the development server after project creation.
 *
 * Offers the user the option to immediately start the development server
 * using their selected package manager. The server runs in the background
 * and the user can continue using the terminal.
 *
 * @param targetDir - Absolute path to the project directory where dev server should start
 * @param packageManager - Package manager command to use (e.g., 'pnpm', 'npm')
 * @param logger - Console logger for displaying prompts and server status
 * @returns Promise resolving to true if dev server was started, false if user skipped
 */
export async function startDevServer(
  targetDir: string,
  packageManager: string,
  logger: ConsoleLogger,
): Promise<boolean> {
  // Prompt user to confirm development server startup
  const { startDev } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'startDev',
      message: '🚀 Start development server?',
      default: true,
    },
  ]);

  // Execute development server startup if user confirmed
  if (startDev) {
    logger.debug(`Starting development server: ${targetDir}`);
    try {
      // execa handles signal cleanup automatically - no manual signal handling needed!
      const child = execa(packageManager, ['run', 'dev'], {
        cwd: targetDir,
        stdio: 'inherit',
        shell: true,
      });

      // Handle process completion
      child.then(
        () => {
          // Process completed successfully
        },
        (error: { exitCode?: number; message: string }) => {
          if (error.exitCode !== 0) {
            logger.error(
              `Development server process exited with code ${error.exitCode}. The server may not have started successfully.`,
            );
            logger.info(
              `Check the output above for error details or try running '${packageManager} run dev' manually`,
            );
          } else {
            logger.error(`Failed to start development server with ${packageManager}: ${error.message}`);
            logger.info(
              `Make sure ${packageManager} is installed and the 'dev' script exists in package.json`,
            );
          }
        },
      );
      return true;
    } catch (error) {
      logger.error(
        `Failed to spawn development server process with ${packageManager}: ${error instanceof Error ? error.message : String(error)}`,
      );
      logger.info(
        `Make sure ${packageManager} is installed and the 'dev' script exists in package.json`,
      );
    }
  }

  return false;
}

export default startDevServer;
