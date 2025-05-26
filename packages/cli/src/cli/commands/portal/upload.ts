import { createCommand } from 'commander';

import { withAuthOptions } from '../../options/auth.js';
import { createEnvOption } from '../../options/env.js';

import { ConsoleLogger } from '../../../bin/utils';
import { initializeFramework } from '../../../lib';
import { uploadPortalBundle } from '../../../bin/portal-upload.js';

export const command = withAuthOptions(
  createCommand('upload')
    .description(
      [
        'Upload a Fusion portal bundle to the Fusion portal registry for deployment.',
        '',
        'This command uploads a distributable portal bundle to the Fusion portal registry using the current authentication and environment.',
        'Supports debug mode and custom environment selection.',
        '',
        'Examples:',
        '  $ fusion portal upload my-portal-bundle.zip',
        '  $ fusion portal upload my-portal-bundle.zip --env prod',
        '  $ fusion portal upload my-portal-bundle.zip --debug',
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
