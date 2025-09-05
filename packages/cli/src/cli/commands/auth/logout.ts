import { createCommand } from 'commander';

import { ConsoleLogger, initializeFramework } from '@equinor/fusion-framework-cli/bin';

import { withAuthOptions } from '../../options/auth.js';

/**
 * CLI command: `logout`
 *
 * Logs out the user from the Fusion Framework CLI and clears the authentication session.
 *
 * This command removes the current authentication state, effectively signing the user out.
 * Supports specifying a custom tenant and client for advanced logout scenarios.
 *
 * @remarks
 * - Useful for invalidating local authentication and ensuring a fresh login on next use.
 * - Does not revoke tokens server-side; only clears local session.
 *
 * @example
 *   $ ffc auth logout
 *   $ ffc auth logout --tenant my-tenant --client my-client-id
 */
export const command = createCommand('logout')
  .description('Log out from Fusion Framework and clear your authentication session.')
  .addHelpText(
    'after',
    [
      '',
      'WHAT THIS COMMAND DOES:',
      '  - Removes your cached authentication tokens from local storage',
      '  - Clears the current session (does not revoke tokens server-side)',
      '  - You will need to run `ffc auth login` again for future commands',
      '',
      'WHEN TO USE THIS COMMAND:',
      '  - When switching between different user accounts',
      '  - When troubleshooting authentication issues',
      '  - When your cached tokens have expired and you want a fresh login',
      '',
      'Examples:',
      '  $ ffc auth logout',
      '  $ ffc auth logout --tenant my-tenant --client my-client-id',
    ].join('\n'),
  )
  .action(async (options) => {
    const log = new ConsoleLogger('auth:logout', { debug: options.debug });

    log.start('Initializing Fusion Framework...');
    const framework = await initializeFramework({
      auth: {
        tenantId: options.tenantId,
        clientId: options.clientId,
      },
    });
    log.succeed('Initialized Fusion Framework');

    try {
      log.start('Logging in...');
      await framework.auth.logout();
      log.succeed('Successfully logged out');
    } catch (error) {
      log.fail(
        'Failed to log out 🥺',
        JSON.stringify({ tenant: options.tenant, client: options.clientId }, undefined, 2),
      );
      throw error;
    }
  });

/**
 * Adds authentication options to the logout command.
 * @see withAuthOptions
 */
withAuthOptions(command, {
  excludeToken: true,
  includeScope: false,
});

export default command;
