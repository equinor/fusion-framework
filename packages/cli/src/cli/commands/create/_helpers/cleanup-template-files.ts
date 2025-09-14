import inquirer from 'inquirer';
import type { ConsoleLogger } from '@equinor/fusion-framework-cli/bin';
import type { ProjectTemplateRepository } from '../../../../bin/helpers/ProjectTemplateRepository.js';

/**
 * Prompt user to clean up temporary template files and execute cleanup.
 *
 * @param repo - ProjectTemplateRepository instance to clean up
 * @param logger - Logger instance for output
 * @returns Promise resolving when cleanup is complete
 */
export async function cleanupTemplateFiles(
  repo: ProjectTemplateRepository,
  logger: ConsoleLogger
): Promise<void> {
  const { cleanupTempFiles } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'cleanupTempFiles',
      message: '🗑️ Clean up temporary template files?',
      default: false,
    },
  ]);

  if (cleanupTempFiles) {
    await repo.cleanup();
  } else {
    logger.debug('Skipping cleanup of temporary template files');
  }
}

export default cleanupTemplateFiles;
