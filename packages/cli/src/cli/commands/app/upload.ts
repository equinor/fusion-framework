import { createCommand } from 'commander';

import { defaultArchive } from './pack.js';

import { withAuthOptions } from '../../options/auth.js';
import { createEnvOption } from '../../options/env.js';

import { uploadApplication } from '../../../bin/app-upload.js';
import { ConsoleLogger } from '../../../bin/utils/ConsoleLogger.js';

import { initializeFramework } from '../../../lib';

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
 *   $ fusion upload [bundle] [options]
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
 *   $ fusion upload
 *   $ fusion upload my-app-bundle.zip --appKey my-app
 *   $ fusion upload --debug
 *
 * @see uploadApplication for implementation details
 */
export const command = withAuthOptions(
  createCommand('upload')
    .description(
      [
        'Upload a Fusion application bundle to the Fusion App Store.',
        '',
        'This command uploads a distributable application bundle (e.g., app-bundle.zip) to the Fusion app registry, making it available for deployment and management.',
        '',
        'Options:',
        '  --appKey <string>   Specify the application key (if omitted, resolved from manifest)',
        '  --env <env>         Target environment (production, staging, etc.)',
        '  --debug             Enable verbose logging for troubleshooting',
        '',
        'Examples:',
        '  $ fusion upload',
        '  $ fusion upload my-app-bundle.zip --appKey my-app',
        '  $ fusion upload --debug',
      ].join('\n'),
    )
    .option('-d, --debug [boolean]', 'Enable debug mode for verbose logging', false)
    .option('-k, --appKey <string>', 'Application key (if not provided, resolved from manifest)')
    .addOption(createEnvOption({ allowDev: false }))
    .argument('[bundle]', 'Application bundle to upload (default: app-bundle.zip)', defaultArchive)
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
