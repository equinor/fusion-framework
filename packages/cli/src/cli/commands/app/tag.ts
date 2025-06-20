import { createCommand } from 'commander';

import type { RuntimeEnv } from '@equinor/fusion-framework-cli/lib';

import {
  initializeFramework,
  ConsoleLogger,
  loadAppManifest,
  tagApplication,
  AllowedAppTags,
} from '@equinor/fusion-framework-cli/bin';

import { createEnvOption } from '../../options/env.js';
import { withAuthOptions } from '../../options/auth.js';

/**
 * CLI command: `tag`
 *
 * Tags a Fusion application with a specific version or preview in the Fusion app registry.
 *
 * Features:
 * - Applies a tag to the specified application version for release management.
 * - App key and version can be provided or resolved from the manifest file.
 * - Supports environment selection, debug, and silent modes.
 *
 * Usage:
 *   $ fusion tag <tag> [options]
 *
 * Arguments:
 *   <tag>                Tag to apply (latest | preview | stable)
 *
 * Options:
 *   --appKey <string>    Application key (if not provided, resolved from manifest)
 *   -v, --version <string> Version to tag (if not provided, resolved from manifest)
 *   -m, --manifest <string> Manifest file to use for resolving app key and version
 *   --debug              Enable debug mode for verbose logging
 *   --silent             Silent mode, suppresses output except errors
 *   -e, --env <env>      Target environment
 *
 * Example:
 *   $ fusion tag latest
 *   $ fusion tag preview --env prod --manifest app.manifest.prod.ts
 *   $ fusion tag stable --appKey my-app --version 1.2.3
 *
 * @see tagApplication for implementation details
 */
export const command = withAuthOptions(
  createCommand('tag')
    .description('Tag your Fusion application with a specific version or preview.')
    .addHelpText(
      'after',
      [
        '',
        'Tags a Fusion application with a specific version or preview in the Fusion app registry.',
        'Applies a tag to the specified application version for release management.',
        'App key and version can be provided or resolved from the manifest file.',
        'Supports environment selection, debug, and silent modes.',
        '',
        'Arguments:',
        '  <tag>   Tag to apply (latest | preview | stable)',
        '',
        'Options:',
        '  --appKey <string>    Application key (if not provided, resolved from manifest)',
        '  -v, --version <string> Version to tag (if not provided, resolved from manifest)',
        '  -m, --manifest <string> Manifest file to use for resolving app key and version',
        '  --debug              Enable debug mode for verbose logging',
        '  --silent             Silent mode, suppresses output except errors',
        '  -e, --env <env>      Target environment',
        '',
        'Examples:',
        '  $ fusion tag latest',
        '  $ fusion tag preview --env prod --manifest app.manifest.prod.ts',
        '  $ fusion tag stable --appKey my-app --version 1.2.3',
      ].join('\n'),
    )
    .addOption(createEnvOption({ allowDev: false }))
    .option('--appKey <string>', 'Application key (if not provided, resolved from manifest)')
    .option('-v, --version <string>', 'Version to tag (if not provided, resolved from manifest)')
    .option('-m, --manifest <string>', 'Manifest file to use for resolving app key and version')
    .option('--debug', 'Enable debug mode for verbose logging')
    .option('--silent', 'Silent mode, suppresses output except errors')
    .argument('<tag>', `Tag to apply (${Object.values(AllowedAppTags).join(' | ')})`)
    .action(async (tag, options) => {
      const log = options.silent ? null : new ConsoleLogger('app:tag', { debug: options.debug });

      const env: RuntimeEnv = {
        command: 'build',
        environment: options.env,
        mode: process.env.NODE_ENV ?? 'production',
        root: process.cwd(),
      };

      let appKey: string = options.appKey;
      let version: string = options.version;
      if (!appKey || !version) {
        const { manifest: appManifest } = await loadAppManifest({
          log,
          manifest: options.manifest,
          env,
        });
        appKey = appKey ?? appManifest.appKey;
        version = version ?? appManifest.build?.version;
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
      log?.start('Tagging application...');
      await tagApplication({
        appKey,
        version,
        framework,
        log,
        tag,
      }).catch((error) => {
        log?.error('Failed to tag application:', error);
        process.exit(1);
      });
    }),
);

export default command;
