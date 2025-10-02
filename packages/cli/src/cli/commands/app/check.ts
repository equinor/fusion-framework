import { createCommand } from 'commander';

import { checkApp, ConsoleLogger } from '@equinor/fusion-framework-cli/bin';

import { createEnvOption } from '../../options/env.js';
import { withAuthOptions } from '../../options/auth.js';

/**
 * CLI command: `check`
 *
 * Checks if the application is registered in the Fusion app store.
 *
 * Features:
 * - Verifies the registration status of your application in the Fusion app store.
 * - Helps identify issues with app registration or configuration.
 * - Supports authentication and environment options.
 * - Provides a debug mode for verbose logging.
 *
 * Usage:
 *   $ ffc app check [options]
 *
 * Options:
 *   -d, --debug         Enable debug mode for verbose logging (default: false)
 *   --env <env> Specify the environment (see available environments)
 *   --token <token>     Provide an authentication token (if required)
 *
 * Example:
 *   $ ffc app check --env prod --debug
 *
 * @see checkApp for implementation details
 */
export const command = withAuthOptions(
  createCommand('check')
    .description('Check if application is registered in Fusion app store.')
    .addHelpText(
      'after',
      [
        '',
        'Verifies the registration status of your application in the Fusion app store.',
        'Helps identify issues with app registration or configuration.',
        '',
        'FIRST TIME SETUP:',
        '  Before checking app status, ensure your app is registered in the Fusion App Admin.',
        '  The check command will tell you if your app is properly registered.',
        '',
        'Examples:',
        '  $ ffc app check',
        '  $ ffc app check --env prod --debug',
      ].join('\n'),
    )
    .option('-d, --debug', 'debug mode', false)
    .addOption(createEnvOption({ allowDev: false }))
    .action(async (options) => {
      const log = new ConsoleLogger('app:check', { debug: !!options.debug });
      await checkApp({
        log,
        environment: options.env,
        auth: 'token' in options ? { token: options.token } : options,
      });
      
      return;
    }),
);

export default command;
