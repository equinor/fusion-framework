import { createCommand } from 'commander';

import { ConsoleLogger, initializeFramework } from '@equinor/fusion-framework-cli/bin';

import { withAuthOptions } from '../../options/auth.js';

/**
 * Command to log out from Fusion Framework and clear your authentication session.
 *
 * This command removes your current authentication state from the Fusion Framework CLI.
 * Supports custom tenant and client options for advanced scenarios.
 */
export const command = createCommand('logout')
  .description('Log out from Fusion Framework and clear your authentication session.')
  .addHelpText(
    'after',
    [
      '',
      'Log out from Fusion Framework and clear your authentication session.',
      '',
      'This command removes your current authentication state from the Fusion Framework CLI.',
      'Supports custom tenant and client options for advanced scenarios.',
      '',
      'Options:',
      '  --tenant <tenantId>   Specify the tenant ID',
      '  --client <clientId>   Specify the client ID',
      '  --debug               Enable debug mode for verbose logging',
      '',
      'Examples:',
      '  $ fusion-framework-cli logout',
      '  $ fusion-framework-cli logout --tenant my-tenant --client my-client-id',
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
