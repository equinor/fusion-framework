import { createCommand } from 'commander';

import { NoAccountsError } from '@equinor/fusion-framework-module-msal-node/error';

import { ConsoleLogger } from '../../../bin/utils';
import { initializeFramework } from '../../../lib/framework.node.js';

import { withAuthOptions } from '../../options/auth.js';

/**
 * Command to acquire and print an access token for Fusion APIs using your current authentication context.
 *
 * This command retrieves an access token for the specified scopes, tenant, and client.
 * Supports debug and silent modes for flexible output.
 *
 * @example
 *   $ fusion token
 *   $ fusion token --scope api://my-app/.default
 *   $ fusion token --tenant my-tenant --client my-client-id --silent
 */
export const command = createCommand('token')
  .description(
    [
      'Acquire and print an access token for Fusion APIs using your current authentication context.',
      '',
      'This command retrieves an access token for the specified scopes, tenant, and client.',
      'Supports debug and silent modes for flexible output.',
      '',
      'Examples:',
      '  $ fusion token',
      '  $ fusion token --scope api://my-app/.default',
      '  $ fusion token --tenant my-tenant --client my-client-id --silent',
    ].join('\n'),
  )
  .option('-d, --debug', 'Enable debug mode for verbose logging', false)
  .option('--silent', 'Only output the token (no extra logging)')
  .action(async (options) => {
    const log = options.silent ? null : new ConsoleLogger('auth:token', { debug: options.debug });

    const scopes = typeof options.scope === 'string' ? [options.scope] : options.scope;

    console.log('options');

    log?.info('Using tenant', options.tenantId);
    log?.info('Using client', options.clientId);
    log?.info('Using scope', JSON.stringify(scopes));

    log?.start('Initializing Fusion Framework...');
    const framework = await initializeFramework({
      auth: {
        tenantId: options.tenantId,
        clientId: options.clientId,
      },
    });
    log?.succeed('Initialized Fusion Framework');

    try {
      log?.start('Getting access token...');
      const accessToken = await framework.auth.acquireAccessToken({ scopes });
      log?.succeed('Successfully acquired access token');
      if (options.silent) {
        console.log(accessToken);
      } else {
        log?.info('Access token:', accessToken);
      }
    } catch (error) {
      if (!options.silent && error instanceof NoAccountsError) {
        log?.fail('No accounts found, please login first');
      } else {
        throw error;
      }
    }
  });

/**
 * Adds authentication options to the token command.
 * @see withAuthOptions
 */
withAuthOptions(command, {
  includeScope: true,
});

export default command;
