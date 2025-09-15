import { existsSync, readdirSync, rmSync } from 'node:fs';
import inquirer from 'inquirer';
import type { ConsoleLogger } from '@equinor/fusion-framework-cli/bin';
import { assert } from '../../../../lib/utils/assert.js';
import { validateSafePath, safeRmSync } from '../../../../lib/utils/path-security.js';

/**
 * Check if target directory exists and has content, then prompt user for action.
 *
 * @param targetDir - Directory to check
 * @param logger - Logger instance for output
 * @param clean - If true, automatically clean the directory without prompting
 * @param baseDir - Base directory for path validation (defaults to process.cwd())
 * @returns Promise resolving to true if should continue, false if should abort
 */
export async function checkTargetDirectory(
  targetDir: string,
  logger: ConsoleLogger,
  clean = false,
  baseDir = process.cwd(),
): Promise<boolean> {
  assert(typeof targetDir === 'string', 'Target directory must be a string');

  // Validate the target directory path for security
  let validatedTargetDir: string;
  try {
    validatedTargetDir = validateSafePath(targetDir, baseDir);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`❌ Invalid target directory path: ${errorMessage}`);
    logger.info(
      '💡 Try using a relative path like "my-app" or ensure the absolute path is within the specified directory.',
    );
    return false; // Return false to abort the operation instead of throwing
  }

  if (!existsSync(validatedTargetDir)) {
    logger.debug(`Target directory does not exist: ${validatedTargetDir}`);
    return true;
  }

  try {
    const contents = readdirSync(validatedTargetDir);
    if (contents.length === 0) {
      logger.debug(`Target directory is empty: ${validatedTargetDir}`);
      return true;
    }

    logger.warn(
      `Target directory '${validatedTargetDir}' is not empty and contains ${contents.length} item(s).`,
    );
    logger.info(
      'Contents:',
      contents.slice(0, 10).join(', ') + (contents.length > 10 ? '...' : ''),
    );

    if (clean) {
      // Clean flag is set, automatically clean the directory
      logger.info('Cleaning target directory (--clean flag)...');
      try {
        safeRmSync(validatedTargetDir, { recursive: true, force: true }, baseDir);
        logger.succeed('Target directory cleaned successfully!');
      } catch (error) {
        logger.error(`Failed to clean target directory: ${error}`);
        logger.info(
          'Check directory permissions and ensure you have write access to the directory.',
        );
        logger.info(
          'You may need to run the command with elevated privileges or manually remove the files.',
        );
        throw error;
      }
    } else {
      // No clean flag, prompt user for action
      const { action } = await inquirer.prompt([
        {
          type: 'list',
          name: 'action',
          message: 'What would you like to do?',
          choices: [
            {
              name: 'Continue - Add files to existing directory',
              value: 'continue',
            },
            {
              name: 'Clean - Remove all existing files and continue',
              value: 'clean',
            },
            {
              name: 'Abort - Cancel the operation',
              value: 'abort',
            },
          ],
          default: 'abort',
        },
      ]);

      if (action === 'abort') {
        logger.info('Operation cancelled by user.');
        return false;
      }

      if (action === 'clean') {
        logger.info('Cleaning target directory...');
        try {
          safeRmSync(validatedTargetDir, { recursive: true, force: true }, baseDir);
          logger.succeed('Target directory cleaned successfully!');
        } catch (error) {
          logger.error(`Failed to clean target directory: ${error}`);
          logger.info(
            'Check directory permissions and ensure you have write access to the directory.',
          );
          logger.info(
            'You may need to run the command with elevated privileges or manually remove the files.',
          );
          throw error;
        }
      } else {
        logger.info('Continuing with existing directory...');
      }
    }

    return true;
  } catch (error) {
    logger.error(`Failed to check target directory: ${error}`);
    logger.info(
      'Ensure the path is valid and accessible, and that you have read permissions for the directory.',
    );
    logger.info(
      'Check if the directory path contains any invalid characters or if the path is too long.',
    );
    throw error;
  }
}

export default checkTargetDirectory;
