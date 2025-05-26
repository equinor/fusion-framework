import { execSync } from 'node:child_process';

/**
 * Resolves the URL of the Git remote named "origin" for the current repository.
 *
 * This function executes a shell command to retrieve the remote URL and converts
 * SSH-style URLs (e.g., `git@github.com:user/repo.git`) to HTTPS-style URLs
 * (e.g., `https://github.com/user/repo`). It also removes the `.git` suffix
 * from the URL if present.
 *
 * @returns The resolved Git remote URL as a string, or `undefined` if the command
 *          fails or the remote "origin" is not configured.
 */
export const resolveGitRemoteUrl = (): string | undefined => {
  const origin = execSync('git remote get-url origin').toString().trim();
  return origin.replace('git@github.com:', 'https://github.com/').replace(/\.git$/, '');
};

export default resolveGitRemoteUrl;
