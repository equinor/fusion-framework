import inquirer from 'inquirer';
import { readdirSync, existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { execSync } from 'node:child_process';
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
    // Check if git config has core.sshCommand
    execSync('git config core.sshCommand', { stdio: 'ignore' });
    hasSSHConfig = true;
    logger?.debug('SSH configuration detected');
  } catch {
    try {
      // Check for SSH keys using Node.js fs APIs for better cross-platform compatibility
      const sshDir = join(homedir(), '.ssh');
      if (existsSync(sshDir)) {
        const sshFiles = readdirSync(sshDir);
        const hasPrivateKeys = sshFiles.some(
          (file) => file.startsWith('id_') && !file.endsWith('.pub'),
        );

        if (hasPrivateKeys) {
          hasSSHConfig = true;
          logger?.debug('SSH keys detected');
        }
      }
    } catch {
      logger?.debug('No SSH configuration detected');
    }
  }

  // Prepare SSH option with explicit disabled state
  const sshDisabledMessage = hasSSHConfig
    ? undefined
    : 'SSH not configured (no SSH keys or git config found)';

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
          disabled: sshDisabledMessage,
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
