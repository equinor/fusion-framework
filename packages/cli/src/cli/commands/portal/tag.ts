import { createCommand } from 'commander';

import type { RuntimeEnv } from '@equinor/fusion-framework-cli/lib';

import {
  initializeFramework,
  loadPortalManifest,
  tagPortal,
  ConsoleLogger,
} from '@equinor/fusion-framework-cli/bin';

import { createEnvOption } from '../../options/env.js';
import { withAuthOptions } from '../../options/auth.js';

export const command = withAuthOptions(
  createCommand('tag')
    .description('Tag your Fusion portal with a specific version or label.')
    .addHelpText(
      'after',
      [
        'Tags your Fusion portal with a specific version or label in the portal registry.',
        '',
        'Options:',
        '  -n, --name      Portal name (if not provided, resolved from manifest)',
        '  -m, --manifest  Manifest file to use for resolving portal name and version',
        '  -v, --version   Version to tag (if not provided, resolved from manifest)',
        '  --env          Target environment',
        '  -d, --debug    Enable debug mode for verbose logging',
        '  --silent       Silent mode, suppresses output except errors',
        '',
        'Examples:',
        '  $ fusion-framework-cli portal tag latest',
        '  $ fusion-framework-cli portal tag preview --env prod --manifest portal.manifest.prod.ts',
      ].join('\n'),
    )
    .addOption(createEnvOption({ allowDev: false }))
    .option(
      '-m, --manifest <string>',
      'Manifest file to use for resolving portal name and version (only used when --package is not provided)',
    )
    .option('-p, --package [package@version]', 'Package to tag (e.g., my-portal@1.0.0)')
    .option('-v, --version <string>', 'Version to tag (if not provided, resolved from manifest)')
    .option('-d, --debug', 'Enable debug mode for verbose logging')
    .option('--silent', 'Silent mode, suppresses output except errors')
    .argument('<tag>', 'Tag to apply (latest | preview)')
    .action(async (tag, options) => {
      const log = options.silent ? null : new ConsoleLogger('app:tag', { debug: options.debug });

      const env: RuntimeEnv = {
        command: 'build',
        environment: options.env,
        mode: process.env.NODE_ENV ?? 'production',
        root: process.cwd(),
      };

      let [name, version] = (options.package ?? '').split('@');
      if (!name || !version) {
        const { manifest: portalManifest } = await loadPortalManifest({
          log,
          manifest: options.manifest,
          env,
        });
        if (!portalManifest) {
          log?.error(
            '😢 No portal manifest found. Please provide a valid manifest file or package name',
          );
          process.exit(1);
        }
        name = portalManifest.name;
        version = portalManifest.build.version;
      }

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

      tagPortal({
        tag,
        name,
        version,
        framework,
        log,
      }).catch((error) => {
        log?.error('😢 Failed to tag application:', error);
        process.exit(1);
      });
    }),
);

export default command;
