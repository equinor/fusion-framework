import { createCommand } from 'commander';

import { createEnvOption } from '../../options/env.js';
import { withAuthOptions } from '../../options/auth.js';

import { tagPortal } from '../../../bin/portal-tag.js';
import { ConsoleLogger } from '../../../bin/utils/ConsoleLogger.js';

import { loadPortalManifest } from '../../../bin/portal-manifest.js';

import { type RuntimeEnv, initializeFramework } from '../../../lib';

export const command = withAuthOptions(
  createCommand('tag')
    .description(
      [
        'Tag your Fusion portal application with a specific version or preview in the Fusion portal registry.',
        '',
        'This command applies a tag to the specified portal version, making it easy to manage releases and previews.',
        'You can provide the portal name and version directly, or let the command resolve them from the manifest file.',
        'Supports environment selection, debug, and silent modes.',
        '',
        'Examples:',
        '  $ fusion portal tag latest',
        '  $ fusion portal tag preview --env prod --manifest portal.manifest.prod.ts',
        '  $ fusion portal tag stable --name my-portal --version 1.2.3',
      ].join('\n'),
    )
    .addOption(createEnvOption({ allowDev: false }))
    .option('-n, --name <string>', 'Portal name (if not provided, resolved from manifest)')
    .option(
      '-m, --manifest <string>',
      'Manifest file to use for resolving portal name and version (only used when --name or --version is not provided)',
    )
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

      let name: string = options.name;
      let version: string = options.version;
      if (!name || !version) {
        const { manifest: portalManifest } = await loadPortalManifest({
          log,
          manifest: options.manifest,
          env,
        });
        name = name ?? portalManifest.name;
        version = version ?? portalManifest.build?.version;
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
