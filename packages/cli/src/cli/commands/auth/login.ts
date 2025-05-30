import chalk from 'chalk';
import { createCommand } from 'commander';
import { ConsoleLogger } from '../../../bin/utils/ConsoleLogger.js';
import { initializeFramework } from '../../../lib/framework.node.js';

import { withAuthOptions } from '../../options/auth.js';

/**
 * Command to authenticate and log in to Fusion Framework using interactive browser-based authentication.
 *
 * This command initializes the Fusion Framework and opens a browser window for secure login.
 * Supports custom tenant, client, and scope options for advanced authentication scenarios.
 *
 * @example
 *   $ fusion login
 *   $ fusion login --tenant my-tenant --client my-client-id --scope api://my-app/.default
 */
const DEFAULT_SERVER_PORT = 49741 as const;

export const command = createCommand('login')
  .description(
    [
      'Authenticate and log in to Fusion Framework using interactive browser-based authentication.',
      '',
      'This command initializes the Fusion Framework and opens a browser window for secure login.',
      'Supports custom tenant, client, and scope options for advanced authentication scenarios.',
      '',
      'Examples:',
      '  $ fusion login',
      '  $ fusion login --tenant my-tenant --client my-client-id --scope api://my-app/.default',
    ].join('\n'),
  )
  .action(async (options) => {
    const log = new ConsoleLogger('auth:login', { debug: options.debug });

    const scopes = typeof options.scope === 'string' ? [options.scope] : options.scope;

    log.start('Initializing Fusion Framework...');
    const framework = await initializeFramework({
      auth: {
        tenantId: options.tenantId,
        clientId: options.clientId,
        interactive: true,
        server: {
          port: DEFAULT_SERVER_PORT,
        },
      },
    });
    log.succeed('Initialized Fusion Framework');

    try {
      log.start('Logging in...');
      const authToken = await framework.auth.login({ scopes });
      log.info('username:', chalk.green(authToken.account?.username));
      log.info('tenant:  ', chalk.yellow(authToken.tenantId));
      log.info('audience:', chalk.yellow(authToken.account?.idTokenClaims?.aud));
      for (const scope of authToken.scopes) {
        log.info('scope:   ', chalk.dim(scope));
      }
      log.succeed('Successfully logged in', chalk.greenBright(authToken.account?.name));
    } catch (error) {
      log.fail(
        'Failed to log in 🥺',
        JSON.stringify({ tenant: options.tenant, client: options.clientId }, undefined, 2),
      );
      throw error;
    }
  });

/**
 * Adds authentication options to the login command.
 * @see withAuthOptions
 */
withAuthOptions(command, {
  includeScope: true,
  excludeToken: true,
});

export default command;
