import { resolve } from 'node:path';
import { tmpdir } from 'node:os';
import type { ConsoleLogger } from '@equinor/fusion-framework-cli/bin';
import { ProjectTemplateRepository } from '../../../../bin/helpers/ProjectTemplateRepository.js';
import { validateSafePath, safeRmSync } from '../../../../lib/utils/path-security.js';
import selectGitProtocol from './select-git-protocol.js';

/**
 * Sets up and initializes a project template repository for template access.
 *
 * This function creates a ProjectTemplateRepository instance and handles
 * the complete initialization process, including optional cleanup of existing
 * repository directories and user protocol selection.
 *
 * @param templateRepoName - Name of the template repository (e.g., 'equinor/fusion-app-template')
 * @param clean - Whether to clean the repo directory before cloning (removes existing directory)
 * @param branch - Git branch to checkout (defaults to 'main')
 * @param logger - Logger instance for output and debugging
 * @returns Promise resolving to the initialized repository ready for template access
 *
 * @example
 * ```typescript
 * const repo = await setupRepository('equinor/fusion-app-template', true, 'main', logger);
 * const templates = await repo.getAvailableTemplates();
 * ```
 */
export async function setupRepository(
  templateRepoName: string,
  clean: boolean,
  branch: string,
  logger: ConsoleLogger,
): Promise<ProjectTemplateRepository> {
  const repoDir = resolve(tmpdir(), 'ffc', 'repo', templateRepoName);
  logger.debug(`Repo dir: ${repoDir}`);

  if (clean) {
    logger.debug(`Removing repo dir: ${repoDir}`);
    // Use safeRmSync for recursive directory removal with path validation
    try {
      // Validate the repo directory path (should be within tmpdir)
      const validatedRepoDir = validateSafePath(repoDir, tmpdir());
      safeRmSync(validatedRepoDir, { recursive: true, force: true }, tmpdir());
    } catch (error) {
      // Log cleanup errors at debug level for troubleshooting
      logger.debug('Cleanup failed:', error);
    }
  }

  // Prompt user to select their preferred Git protocol
  const protocol = await selectGitProtocol(logger);

  const repo = new ProjectTemplateRepository(templateRepoName, {
    baseDir: repoDir,
    log: logger,
    branch: branch,
    protocol: protocol,
  });

  await repo.initialize();
  return repo;
}

export default setupRepository;
