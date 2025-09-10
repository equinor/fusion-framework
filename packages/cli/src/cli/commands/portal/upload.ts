import { createCommand } from 'commander';

import {
  initializeFramework,
  uploadPortalBundle,
  ConsoleLogger,
} from '@equinor/fusion-framework-cli/bin';

import { withAuthOptions } from '../../options/auth.js';
import { createEnvOption } from '../../options/env.js';

/**
 * CLI command: `upload`
 *
 * Uploads a Fusion portal bundle to the portal registry.
 *
 * Features:
 * - Uploads a distributable portal bundle to the portal registry for deployment.
 * - Supports specifying environment and debug mode.
 *
 * Usage:
 *   $ ffc portal upload [bundle] [options]
 *
 * Arguments:
 *   [bundle]             Portal bundle to upload (e.g., out/bundle.zip)
 *
 * Options:
 *   -d, --debug          Enable debug mode for verbose logging
 *   -e, --env <env>      Target environment
 *
 * Example:
 *   $ ffc portal upload my-portal-bundle.zip
 *   $ ffc portal upload my-portal-bundle.zip --env prod
 *
 * @see uploadPortalBundle for implementation details
 */
export const command = withAuthOptions(
  createCommand('upload')
    .description('Upload a Fusion portal bundle to the portal registry.')
    .addHelpText(
      'after',
      [
        '',
        'Uploads a distributable portal bundle (e.g., portal-bundle.zip) to the Fusion portal registry.',
        '',
        'Examples:',
        '  $ ffc portal upload',
        '  $ ffc portal upload my-portal-bundle.zip --name my-portal',
        '  $ ffc portal upload --debug',
      ].join('\n'),
    )
    .option('-d, --debug [boolean]', 'Enable debug mode for verbose logging', false)
    .addOption(createEnvOption({ allowDev: false }))
    .argument('<bundle>', 'Portal bundle to upload (e.g., out/bundle.zip)')
    .action(async (bundle, options) => {
      const log = new ConsoleLogger('portal:upload', { debug: options.debug });

      log?.start('Initializing Fusion Framework...');
      const framework = await initializeFramework({
        env: options.env,
        auth: {
          token: options.token,
          tenantId: options.tenantId,
          clientId: options.clientId,
        },
      });
      log?.succeed('Initialized Fusion Framework');
      await uploadPortalBundle({ log, framework, fileOrBundle: bundle }).catch((error) => {
        log.error('Failed to upload bundle:', error);
        process.exit(1);
      });
    }),
);
export default command;
