import { createCommand } from 'commander';

import { DEFAULT_ARCHIVE } from './pack.js';

import {
  initializeFramework,
  ConsoleLogger,
  uploadApplication,
} from '@equinor/fusion-framework-cli/bin';

import { withAuthOptions } from '../../options/auth.js';
import { createEnvOption } from '../../options/env.js';

/**
 * CLI command: `upload`
 *
 * Uploads a Fusion application bundle to the Fusion App Store.
 *
 * Features:
 * - Uploads a distributable application bundle (e.g., app-bundle.zip) to the Fusion app registry.
 * - Supports specifying application key, environment, and debug mode.
 *
 * Usage:
 *   $ ffc app upload [bundle] [options]
 *
 * Arguments:
 *   [bundle]             Application bundle to upload (default: app-bundle.zip)
 *
 * Options:
 *   -k, --appKey <string> Application key (if not provided, resolved from manifest)
 *   -e, --env <env>      Target environment
 *   -d, --debug          Enable debug mode for verbose logging
 *
 * Example:
 *   $ ffc app upload
 *   $ ffc app upload my-app-bundle.zip --appKey my-app
 *   $ ffc app upload --debug
 *
 * @see uploadApplication for implementation details
 */
export const command = withAuthOptions(
  createCommand('upload')
    .description('Upload a Fusion application bundle to the Fusion App Store.')
    .addHelpText(
      'after',
      [
        '',
        'Uploads a distributable application bundle (e.g., app-bundle.zip) to the Fusion app store.',
        '',
        'Examples:',
        '  $ ffc app upload',
        '  $ ffc app upload my-app-bundle.zip --appKey my-app',
        '  $ ffc app upload --debug',
      ].join('\n'),
    )
    .option('-d, --debug [boolean]', 'Enable debug mode for verbose logging', false)
    .option('-k, --appKey <string>', 'Application key (if not provided, resolved from the build metadata of the bundle)')
    .addOption(createEnvOption({ allowDev: false }))
    .argument('[bundle]', 'Application bundle to upload', DEFAULT_ARCHIVE)
    .action(async (bundle, options) => {
      const log = new ConsoleLogger('portal:upload', {
        debug: options.debug,
      });
      log?.start('💾 Initializing Fusion Framework...');
      const framework = await initializeFramework({
        env: options.env,
        auth: {
          token: options.token,
          tenantId: options.tenantId,
          clientId: options.clientId,
        },
      });
      log?.succeed('💾 Initialized Fusion Framework');

      await uploadApplication({
        log,
        appKey: options.appKey,
        framework,
        fileOrBundle: bundle,
      }).catch((error) => {
        log.error('😢 Failed to upload bundle:', error);
        process.exit(1);
      });
    }),
);

export default command;
