import { createCommand } from 'commander';

import { createEnvOption } from '../../options/env.js';
import { withAuthOptions } from '../../options/auth.js';

import checkApp from '../../../bin/app-check.js';
import { ConsoleLogger } from '../../../bin/utils';

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
 *   $ fusion check [options]
 *
 * Options:
 *   -d, --debug         Enable debug mode for verbose logging (default: false)
 *   --environment <env> Specify the environment (see available environments)
 *   --token <token>     Provide an authentication token (if required)
 *
 * Example:
 *   $ fusion check --environment prod --debug
 *
 * @see checkApp for implementation details
 */
export const command = withAuthOptions(
  createCommand('check')
    .description(
      [
        'Check if application is registered in Fusion app store',
        'This command verifies the registration status of your application in the Fusion app store.',
        "It can help identify issues with your app's registration or configuration.",
      ].join('\n'),
    )
    .option('-d, --debug', 'debug mode', false)
    .addOption(createEnvOption({ allowDev: false }))
    .action((options) => {
      const log = new ConsoleLogger('app:check', { debug: !!options.debug });
      return checkApp({
        log,
        environment: options.environment,
        auth: 'token' in options ? { token: options.token } : options,
      });
    }),
);

export default command;
