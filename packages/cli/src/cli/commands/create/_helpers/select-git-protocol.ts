import inquirer from 'inquirer';
import { readdirSync, existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { execSync } from 'node:child_process';
import type { ConsoleLogger } from '@equinor/fusion-framework-cli/bin';
import type { GitClientProtocol } from '../../../../bin/helpers/ProjectTemplateRepository.js';

// Common SSH private key file extensions
const PRIVATE_KEY_EXTENSIONS = ['.rsa', '.ed25519', '.ecdsa', '.dsa'] as const;
const PRIVATE_KEY_PATTERN = /(_rsa|_ed25519|_ecdsa|_dsa)$/;

// Known non-private-key files in .ssh directory
const NON_KEY_FILES = new Set([
  'known_hosts',
  'config',
  'authorized_keys',
  'authorized_keys2',
  'ssh_config',
  'ssh_known_hosts',
]);

/**
 * Checks if Git has SSH configuration via core.sshCommand
 * @returns true if SSH command is configured, false otherwise
 */
function checkGitSSHConfig(): boolean {
  try {
    execSync('git config core.sshCommand', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

/**
 * Checks if a filename represents an SSH private key file
 * @param filename - The filename to check
 * @returns true if the file appears to be an SSH private key, false otherwise
 */
function isSSHPrivateKey(filename: string): boolean {
  // Skip public key files
  if (filename.endsWith('.pub')) {
    return false;
  }

  // Skip known non-key files
  if (NON_KEY_FILES.has(filename)) {
    return false;
  }

  // Check for standard naming patterns
  const isStandardName = filename.startsWith('id_');
  const hasPrivateKeyExtension = PRIVATE_KEY_EXTENSIONS.some((ext) => filename.endsWith(ext));
  const hasServiceKeySuffix = PRIVATE_KEY_PATTERN.test(filename);

  return isStandardName || hasPrivateKeyExtension || hasServiceKeySuffix;
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
      if (dirent.isFile() && isSSHPrivateKey(dirent.name)) {
        logger?.debug('SSH private key detected in .ssh directory');
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
 * intelligent defaults based on SSH configuration detection. If a protocol
 * is provided, it will be used directly without prompting.
 *
 * @param logger - Optional logger instance for debug output
 * @param protocol - Optional protocol to use directly (skips prompt if provided)
 * @returns Promise resolving to the selected Git protocol ('https' or 'ssh')
 *
 * @example
 * ```typescript
 * const protocol = await selectGitProtocol(logger);
 * console.log(`Using ${protocol} protocol for cloning`);
 *
 * // Non-interactive mode
 * const protocol = await selectGitProtocol(logger, 'https');
 * ```
 */
export async function selectGitProtocol(
  logger?: ConsoleLogger,
  protocol?: GitClientProtocol,
): Promise<GitClientProtocol> {
  // If protocol is provided, use it directly without prompting
  if (protocol) {
    logger?.debug(`Using provided protocol: ${protocol}`);
    return protocol;
  }

  logger?.debug('Detecting SSH configuration...');

  // Check for SSH configuration in order of preference
  const hasSSHConfig = checkGitSSHConfig() || checkSSHKeys(logger);

  if (hasSSHConfig) {
    logger?.debug('SSH configuration detected');
  }

  // Prepare SSH option with explicit disabled state
  const sshDisabledMessage = hasSSHConfig
    ? undefined
    : 'SSH not configured (no SSH keys or git config found)';

  const { selectedProtocol } = await inquirer.prompt([
    {
      type: 'select',
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
