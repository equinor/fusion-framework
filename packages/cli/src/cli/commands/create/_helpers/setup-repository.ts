import { resolve } from 'node:path';
import { tmpdir } from 'node:os';
import type { ConsoleLogger } from '@equinor/fusion-framework-cli/bin';
import {
  ProjectTemplateRepository,
  type GitClientProtocol,
} from '../../../../bin/helpers/ProjectTemplateRepository.js';
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
 * @param protocol - Optional Git protocol to use (skips prompt if provided)
 * @returns Promise resolving to the initialized repository ready for template access
 *
 * @example
 * ```typescript
 * const repo = await setupRepository('equinor/fusion-app-template', true, 'main', logger);
 * const templates = await repo.getAvailableTemplates();
 *
 * // Non-interactive mode
 * const repo = await setupRepository('equinor/fusion-app-template', true, 'main', logger, 'https');
 * ```
 */
export async function setupRepository(
  templateRepoName: string,
  clean: boolean,
  branch: string,
  logger: ConsoleLogger,
  protocol?: GitClientProtocol,
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

  // Select Git protocol (prompts if not provided)
  const selectedProtocol = await selectGitProtocol(logger, protocol);

  const repo = new ProjectTemplateRepository(templateRepoName, {
    baseDir: repoDir,
    log: logger,
    branch: branch,
    protocol: selectedProtocol,
  });

  await repo.initialize();
  return repo;
}

export default setupRepository;
