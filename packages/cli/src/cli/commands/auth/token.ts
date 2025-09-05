import { createCommand } from 'commander';

import { NoAccountsError } from '@equinor/fusion-framework-module-msal-node/error';

import { ConsoleLogger, initializeFramework } from '@equinor/fusion-framework-cli/bin';

import { withAuthOptions } from '../../options/auth.js';

/**
 * CLI command: `token`
 *
 * Acquires and prints an access token for Fusion APIs using your current authentication context.
 *
 * This command retrieves an access token for the specified scopes, tenant, and client.
 * Supports debug and silent modes for flexible output.
 *
 * @remarks
 * - Supports specifying scopes, tenant, and client for advanced token acquisition.
 * - Silent mode outputs only the token (no extra logging).
 *
 * @example
 *   $ ffc auth token
 *   $ export MY_TOKEN=$(ffc auth token --silent)
 *   $ ffc auth token --scope api://my-app/.default
 *   $ ffc auth token --tenant my-tenant --client my-client-id --silent
 *
 * @see acquireAccessToken for token acquisition implementation details
 */
export const command = createCommand('token')
  .description(
    'Acquire and print an access token for Fusion APIs using your current authentication context.',
  )
  .addHelpText(
    'after',
    [
      '',
      'USAGE NOTES:',
      '  - This command acquires an access token using your current interactive login session.',
      '  - It is intended for local development, manual testing, and debugging authentication issues.',
      '',
      'LIMITATIONS:',
      '  - Requires an interactive user session (not suitable for CI/CD or headless environments).',
      '  - Will only work if you have previously logged in using `ffc auth login`.',
      '  - Does NOT prompt for login; if no cached credentials are found, you must log in first.',
      '  - For automation or CI/CD, set the FUSION_TOKEN environment variable instead.',
      '',
      'BEST PRACTICES:',
      '  - Use this command to quickly fetch a token for manual API calls or local scripts.',
      '  - Use the --silent flag to output only the token (useful for scripting or piping).',
      '  - Specify --scope, --tenant, or --client for advanced scenarios.',
      '',
      'EXAMPLES:',
      '  $ ffc auth token',
      '  $ export MY_TOKEN=$(ffc auth token --silent)',
      '  $ ffc auth token --scope api://my-app/.default',
      '  $ ffc auth token --tenant my-tenant --client my-client-id --silent',
    ].join('\n'),
  )
  .option('-d, --debug', 'Enable debug mode for verbose logging', false)
  .option('--silent', 'Only output the token (no extra logging)')
  .action(async (options) => {
    const log = options.silent ? null : new ConsoleLogger('auth:token', { debug: options.debug });

    const scopes = typeof options.scope === 'string' ? [options.scope] : options.scope;

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
