import { createCommand } from 'commander';

import chalk from 'chalk';

import { withAuthOptions } from '../../options/auth.js';
import { createEnvOption } from '../../options/env.js';

import {
  initializeFramework,
  ConsoleLogger,
  bundlePortal,
  uploadPortalBundle,
  tagPortal,
  AllowedPortalTags,
} from '@equinor/fusion-framework-cli/bin';

/**
 * CLI command: `publish`
 *
 * Builds, uploads, and tags a Fusion portal bundle for deployment to the portal registry.
 *
 * Features:
 * - Bundles the portal, uploads it to the Fusion portal registry, and applies a tag for versioning.
 * - Supports specifying environment, manifest file, and tag.
 * - Debug mode and authentication options are supported.
 *
 * Usage:
 *   $ ffc portal publish [options]
 *
 * Options:
 *   -d, --debug          Enable debug mode for verbose logging
 *   -e, --env <env>      Target environment
 *   -m, --manifest       Manifest file to use for bundling
 *   -t, --tag            Tag to apply to the published portal
 *
 * Example:
 *   $ ffc portal publish
 *   $ ffc portal publish --env prod --manifest portal.manifest.prod.ts
 *   $ ffc portal publish --tag preview
 *
 * @see uploadPortalBundle, tagPortal for implementation details
 */
export const command = withAuthOptions(
  createCommand('publish')
    .description('Build, upload, and tag your Fusion portal bundle for deployment.')
    .addHelpText(
      'after',
      [
        '',
        'If no manifest is provided, a default portal.manifest(.$ENV)?.[ts|js|json] is used from the current directory.',
        'example: `ffc portal publish --env prod` will search for `portal.manifest.prod.ts` then fallback to `portal.manifest.ts`',
        '',
        'NOTE: portal manifest is not required, a default manifest will be generated if not provided',
        '',
        'Examples:',
        '  $ ffc portal publish',
        '  $ ffc portal publish --env prod --manifest portal.manifest.prod.ts',
        '  $ ffc portal publish --tag preview',
      ].join('\n'),
    )
    .option('-d, --debug', 'Enable debug mode for verbose logging', false)
    .addOption(createEnvOption({ allowDev: false }))
    .option(
      '-m, --manifest [string]',
      'Manifest file to use for bundling (e.g., my-portal.manifest.ts)',
    )
    .option('--schema [string]', 'Schema file to use for validation')
    .option(
      '-t, --tag [string]',
      `Tag to apply to the published portal (${Object.values(AllowedPortalTags).join(' | ')})`,
      AllowedPortalTags.Latest,
    )
    .action(async (options) => {
      const log = new ConsoleLogger('portal:publish', {
        debug: options.debug,
      });

      log?.info('Using environment:', chalk.redBright(options.env));

      log.start('📦 Bundling Portal Template...');
      const bundle = await bundlePortal({
        log,
        manifest: options.manifest,
        schema: options.schema,
      }).catch((error) => {
        log.error('😢 Failed to create bundle:', error);
        process.exit(1);
      });
      log.succeed('📦 Bundling completed');

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

      log.start('🚀 Uploading Portal Template...');
      await uploadPortalBundle({ log, framework, fileOrBundle: bundle.archive }).catch((error) => {
        log.error('😢 Failed to upload bundle:', error);
        process.exit(1);
      });
      log.succeed('🚀 Upload completed');

      log.start('🏷️ Tagging Portal Template...');
      await tagPortal({
        tag: options.tag,
        name: bundle.manifest.name,
        version: bundle.manifest.build.version,
        framework,
        log,
      }).catch((error) => {
        log.error('😢 Failed to tag Portal Template:', error);
        process.exit(1);
      });
      log.succeed('🏷️ Tagging completed');
    }),
);

export default command;
