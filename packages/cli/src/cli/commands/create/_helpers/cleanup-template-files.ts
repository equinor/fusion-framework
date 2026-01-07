import inquirer from 'inquirer';
import type { ConsoleLogger } from '@equinor/fusion-framework-cli/bin';
import type { ProjectTemplateRepository } from '../../../../bin/helpers/ProjectTemplateRepository.js';

/**
 * Prompts the user to clean up temporary template files after project creation.
 *
 * Offers the user the option to remove the cloned template repository and
 * temporary files to free up disk space. If the user declines, the files
 * remain available for future use. If cleanup is explicitly provided, it
 * will be used directly without prompting.
 *
 * @param repo - ProjectTemplateRepository instance containing temporary files
 * @param logger - Console logger for displaying prompts and cleanup status
 * @param cleanup - Optional cleanup flag to use directly (skips prompt if provided)
 * @returns Promise that resolves when the cleanup process is complete
 */
export async function cleanupTemplateFiles(
  repo: ProjectTemplateRepository,
  logger: ConsoleLogger,
  cleanup?: boolean,
): Promise<void> {
  // If cleanup flag is provided, use it directly without prompting
  if (cleanup !== undefined) {
    if (cleanup) {
      await repo.cleanup();
    } else {
      logger.debug('Skipping cleanup of temporary template files');
    }
    return;
  }

  // Prompt user to confirm cleanup of temporary template files
  const { cleanupTempFiles } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'cleanupTempFiles',
      message: '🗑️ Clean up temporary template files?',
      default: false,
    },
  ]);

  // Execute cleanup based on user's choice
  if (cleanupTempFiles) {
    await repo.cleanup();
  } else {
    logger.debug('Skipping cleanup of temporary template files');
  }
}

export default cleanupTemplateFiles;
