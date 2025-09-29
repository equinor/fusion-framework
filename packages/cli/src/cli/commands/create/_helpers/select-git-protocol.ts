import inquirer from 'inquirer';
import { readdirSync, existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { execSync } from 'node:child_process';
import type { ConsoleLogger } from '@equinor/fusion-framework-cli/bin';
import type { GitClientProtocol } from '../../../../bin/helpers/ProjectTemplateRepository.js';

/**
 * Checks if Git has SSH configuration via core.sshCommand
 * @param logger - Optional logger for debug output
 * @returns true if SSH command is configured, false otherwise
 */
function checkGitSSHConfig(logger?: ConsoleLogger): boolean {
  try {
    execSync('git config core.sshCommand', { stdio: 'ignore' });
    logger?.debug('SSH configuration detected via git config');
    return true;
  } catch {
    return false;
  }
}

/**
 * Checks if SSH private keys exist in the user's .ssh directory
 * @param logger - Optional logger for debug output
 * @returns true if private SSH keys are found, false otherwise
 */
function checkSSHKeys(logger?: ConsoleLogger): boolean {
  try {
    const sshDir = join(homedir(), '.ssh');
    if (!existsSync(sshDir)) {
      return false;
    }

    // Use withFileTypes for better performance and stop on first match
    for (const dirent of readdirSync(sshDir, { withFileTypes: true })) {
      if (dirent.isFile() && dirent.name.startsWith('id_') && !dirent.name.endsWith('.pub')) {
        logger?.debug('SSH private key detected');
        return true;
      }
    }
    return false;
  } catch {
    return false;
  }
}

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

  // Check for SSH configuration in order of preference
  const hasSSHConfig = checkGitSSHConfig(logger) || checkSSHKeys(logger);

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
