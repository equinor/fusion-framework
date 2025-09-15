import { spawn } from 'node:child_process';
import inquirer from 'inquirer';
import type { ConsoleLogger } from '@equinor/fusion-framework-cli/bin';

/**
 * Prompts the user to start the development server after project creation.
 *
 * Offers the user the option to immediately start the development server
 * using their selected package manager. The server runs in the foreground
 * and can be stopped with Ctrl+C. When persistent mode is enabled, the server
 * will run indefinitely until manually terminated by the user.
 *
 * @param targetDir - Absolute path to the project directory where dev server should start
 * @param packageManager - Package manager command to use (e.g., 'pnpm', 'npm')
 * @param logger - Console logger for displaying prompts and server status
 * @param persistent - If true, runs the dev server indefinitely without timeout (default: false)
 * @returns Promise resolving to true if dev server was started, false if user skipped
 */
export async function startDevServer(
  targetDir: string,
  packageManager: string,
  logger: ConsoleLogger,
  persistent = false,
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
    if (persistent) {
      logger.info('Running in persistent mode - server will run until manually stopped (Ctrl+C)');
    }

    try {
      // Spawn dev server process - will run in foreground but can be stopped with Ctrl+C
      // NOTE: This intentionally blocks the CLI process to show dev server output.
      // This is the desired behavior - users want to see the dev server startup and output.
      const child = spawn(packageManager, ['run', 'dev'], {
        cwd: targetDir,
        stdio: 'inherit',
      });

      // Only set timeout if not in persistent mode
      // In persistent mode, the server runs indefinitely until user manually stops it
      let timeout: NodeJS.Timeout | null = null;
      let timeoutReached = false;

      if (!persistent) {
        // Set a timeout to prevent indefinite hanging (e.g., 60 seconds)
        // This helps catch cases where the dev server fails to start properly
        const DEV_SERVER_TIMEOUT_MS = 60_000;
        timeout = setTimeout(() => {
          timeoutReached = true;
          logger.error(
            `Development server did not start within ${DEV_SERVER_TIMEOUT_MS / 1000} seconds and may be hanging. Terminating process.`,
          );
          child.kill('SIGTERM');
          logger.info(
            `You can try running '${packageManager} run dev' manually in the project directory.`,
          );
        }, DEV_SERVER_TIMEOUT_MS);
      }

      // Cleanup function to clear timeout and listeners
      // Only clear timeout if it was set (non-persistent mode)
      const cleanup = () => {
        if (timeout) {
          clearTimeout(timeout);
        }
        child.removeAllListeners('error');
        child.removeAllListeners('exit');
      };

      // Handle potential spawn errors (e.g., package manager not found)
      child.on('error', (err) => {
        cleanup();
        if (!timeoutReached) {
          logger.error(`Failed to start development server with ${packageManager}: ${err.message}`);
          logger.info(
            `Make sure ${packageManager} is installed and the 'dev' script exists in package.json`,
          );
        }
      });

      // Handle process exit with non-zero code
      // In persistent mode, we don't treat non-zero exit codes as errors since
      // the user might intentionally stop the server
      child.on('exit', (code) => {
        cleanup();
        if (!timeoutReached && code !== 0 && !persistent) {
          logger.error(
            `Development server process exited with code ${code}. The server may not have started successfully.`,
          );
          logger.info(
            `Check the output above for error details or try running '${packageManager} run dev' manually`,
          );
        } else if (persistent && code !== 0) {
          logger.info(`Development server stopped with exit code ${code}`);
        }
      });

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
