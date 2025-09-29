import inquirer from 'inquirer';
import type { ConsoleLogger } from '@equinor/fusion-framework-cli/bin';
import type { GitClientProtocol } from '../../../../bin/helpers/ProjectTemplateRepository.js';

/**
 * Prompts the user to select their preferred Git protocol for repository cloning.
 *
 * This function presents a choice between HTTPS and SSH protocols, with
 * intelligent defaults based on SSH configuration detection.
 *
 * @param logger - Optional logger instance for debug output
 * @returns Promise resolving to the selected Git protocol ('https' or 'ssh')
 *
 * @example
 * ```typescript
 * const protocol = await selectGitProtocol(logger);
 * console.log(`Using ${protocol} protocol for cloning`);
 * ```
 */
export async function selectGitProtocol(logger?: ConsoleLogger): Promise<GitClientProtocol> {
  logger?.debug('Detecting SSH configuration...');

  // Try to detect if SSH is configured
  let hasSSHConfig = false;
  try {
    const { execSync } = await import('node:child_process');
    // Check if git config has core.sshCommand or if SSH keys exist
    execSync('git config core.sshCommand', { stdio: 'ignore' });
    hasSSHConfig = true;
    logger?.debug('SSH configuration detected');
  } catch {
    try {
      const { execSync } = await import('node:child_process');
      // Check for SSH keys as fallback
      execSync('ls -la ~/.ssh/id_* 2>/dev/null | grep -v ".pub$" | head -1', { stdio: 'ignore' });
      hasSSHConfig = true;
      logger?.debug('SSH keys detected');
    } catch {
      logger?.debug('No SSH configuration detected');
    }
  }

  const { selectedProtocol } = await inquirer.prompt([
    {
      type: 'list',
      name: 'selectedProtocol',
      message: '🔐 Which Git protocol would you like to use for cloning?',
      choices: [
        {
          name: 'HTTPS - Works with personal access tokens and is generally more compatible',
          value: 'https',
          short: 'HTTPS',
        },
        {
          name: 'SSH - Faster and more secure, but requires SSH key setup',
          value: 'ssh',
          short: 'SSH',
          disabled: !hasSSHConfig ? 'SSH not configured (no SSH keys or git config found)' : false,
        },
      ],
      default: hasSSHConfig ? 'ssh' : 'https',
      pageSize: 5,
      loop: false,
    },
  ]);

  logger?.debug(`Selected protocol: ${selectedProtocol}`);
  return selectedProtocol;
}

export default selectGitProtocol;
