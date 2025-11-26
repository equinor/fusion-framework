import type { ChangedFile } from '../utils/git/index.js';
import { getChangedFiles, getGitStatus } from '../utils/git/index.js';
import type { CommandOptions } from '../command.options.js';

/**
 * Handles diff-based processing to get changed files from git.
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

    if (changedFiles.length === 0) {
      console.log('✅ No changed files match the provided patterns. Nothing to process.');
      process.exit(0);
    }

    console.log(`📝 Found ${changedFiles.length} changed files matching patterns`);
    return changedFiles;
  } catch (error) {
    console.error(`❌ Git diff error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    process.exit(1);
  }
}
