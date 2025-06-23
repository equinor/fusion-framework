import { createCommand } from 'commander';

import {
  initializeFramework,
  uploadPortalBundle,
  ConsoleLogger,
} from '@equinor/fusion-framework-cli/bin';

import { withAuthOptions } from '../../options/auth.js';
import { createEnvOption } from '../../options/env.js';

export const command = withAuthOptions(
  createCommand('upload')
    .description('Upload a Fusion portal bundle to the portal registry.')
    .addHelpText(
      'after',
      [
        'Uploads a distributable Fusion portal bundle to the portal registry for deployment.',
        '',
        'Options:',
        '  --env      Target environment',
        '  -d, --debug    Enable debug mode for verbose logging',
        '',
        'Examples:',
        '  $ fusion-framework-cli portal upload my-portal-bundle.zip',
        '  $ fusion-framework-cli portal upload my-portal-bundle.zip --env prod',
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
