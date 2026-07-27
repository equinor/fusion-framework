import type { ChangedFile } from '../utils/git/index.js';
import { getChangedFiles, getGitStatus } from '../utils/git/index.js';
import type { CommandOptions } from '../embeddings-command.options.js';

/**
 * Handles diff-based processing to get changed files from git.
 *
 * @param options - Command options controlling diff mode and base reference.
 * @returns The list of changed files matching the configured patterns.
 * @internal
 */
export async function getDiff(options: CommandOptions): Promise<ChangedFile[]> {
  try {
    // Get current git status for informational output
    const gitStatus = await getGitStatus();
    console.log(`🔍 Git status: ${gitStatus.branch}@${gitStatus.commit}`);
    console.log(`📊 Changes: ${gitStatus.stagedFiles} staged, ${gitStatus.unstagedFiles} unstaged`);

    // Get changed files compared to base reference (default: HEAD~1)
    const changedFiles = await getChangedFiles({
      diff: options.diff,
      baseRef: options.baseRef,
    });

    // Bail out early when no changed files match the configured patterns.
    if (changedFiles.length === 0) {
      console.log('✅ No changed files match the provided patterns. Nothing to process.');
      process.exit(0);
    }

    console.log(`📝 Found ${changedFiles.length} changed files matching patterns`);
    // Log each changed file's status when --debug is set.
    if (options.debug) {
      // Print status/filepath pairs one at a time for readable debug output.
      for (const file of changedFiles) {
        console.debug(`[debug] ${file.status}: ${file.filepath}`);
      }
    }
    return changedFiles;
  } catch (error) {
    console.error(`❌ Git diff error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    process.exit(1);
  }
}
