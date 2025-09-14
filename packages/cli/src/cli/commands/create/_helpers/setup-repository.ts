import { rmSync } from 'node:fs';
import { resolve } from 'node:path';
import { tmpdir } from 'node:os';
import type { ConsoleLogger } from '@equinor/fusion-framework-cli/bin';
import { ProjectTemplateRepository } from '../../../../bin/helpers/ProjectTemplateRepository.js';

/**
 * Set up and initialize the project template repository.
 *
 * @param templateRepoName - Name of the template repository
 * @param clean - Whether to clean the repo directory before cloning
 * @param branch - Branch to checkout
 * @param logger - Logger instance for output
 * @returns Promise resolving to the initialized repository
 */
export async function setupRepository(
  templateRepoName: string,
  clean: boolean,
  branch: string,
  logger: ConsoleLogger
): Promise<ProjectTemplateRepository> {
  const repoDir = resolve(tmpdir(), 'ffc', 'repo', templateRepoName);
  logger.debug(`Repo dir: ${repoDir}`);

  if (clean) {
    logger.debug(`Removing repo dir: ${repoDir}`);
    // Use rmSync for recursive directory removal (Node.js >= v14.14.0)
    try {
      rmSync(repoDir, { recursive: true, force: true });
    } catch {
      // ignore cleanup errors
    }
  }

  const repo = new ProjectTemplateRepository(templateRepoName, {
    baseDir: repoDir,
    log: logger,
    branch: branch,
  });

  await repo.initialize();
  return repo;
}

export default setupRepository;
