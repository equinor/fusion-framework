import { createCommand } from 'commander';

import chalk from 'chalk';

import { ConsoleLogger, initializeFramework } from '@equinor/fusion-framework-cli/bin';

import { withAuthOptions } from '../../options/auth.js';

/**
 * Command to authenticate and log in to Fusion Framework using interactive browser-based authentication.
 *
 * This command initializes the Fusion Framework and opens a browser window for secure login.
 * Supports custom tenant, client, and scope options for advanced authentication scenarios.
 */
const DEFAULT_SERVER_PORT = 49741 as const;

/**
 * Command to authenticate and log in to Fusion Framework using interactive browser-based authentication.
 *
 * This command initializes the Fusion Framework and opens a browser window for secure login.
 * Supports custom tenant, client, and scope options for advanced authentication scenarios.
 *
 * @remarks
 * - Opens a browser for user authentication.
 * - Stores authentication state for future CLI commands.
 *
 * @example
 *   $ ffc auth login
 *   $ ffc auth login --tenant my-tenant --client my-client-id --scope api://my-app/.default
 */
export const command = createCommand('login')
  .description(
    'Authenticate and log in to Fusion Framework using interactive browser-based authentication.',
  )
  .addHelpText(
    'after',
    [
      '',
      'WHAT HAPPENS WHEN YOU RUN THIS COMMAND:',
      '  1. Opens a browser window for Azure AD authentication',
      '  2. Prompts you to sign in with your Fusion credentials',
      '  3. Securely caches your tokens for future CLI commands',
      '  4. You only need to log in once per session',
      '',
      'Note: Requires interactive environment (won\'t work in CI/CD pipelines)',
      '',
      'Examples:',
      '  $ ffc auth login',
      '  $ ffc auth login --tenant my-tenant --client my-client-id --scope api://my-app/.default',
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
