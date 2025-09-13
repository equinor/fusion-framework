import { createCommand } from 'commander';

import type AdmZip from 'adm-zip';

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
 *   $ ffc portal publish [bundle] [options]
 *
 * Arguments:
 *   [bundle]             Path to the portal bundle to upload
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
 *   $ ffc portal publish --tag latest app.bundle.zip
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
        '  $ ffc portal publish --tag latest portal.bundle.zip',
      ].join('\n'),
    )
    .option('-d, --debug', 'Enable debug mode for verbose logging', false)
    .addOption(createEnvOption({ allowDev: false }))

    .argument('[bundle]', 'Portal Template bundle to upload')
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
    .action(async (bundle, options) => {
      const log = new ConsoleLogger('portal:publish', {
        debug: options.debug,
      });

      log?.info('Using environment:', chalk.redBright(options.env));

      let archive: string | AdmZip;
      if (bundle) {
        log.info(`📦 Using provided bundle: ${bundle}`);
        archive = bundle;
      } else {
        try {
          log.start('📦 Bundling Portal Template...');
          const buildResult = await bundlePortal({
            log,
            manifest: options.manifest,
            schema: options.schema,
          });
          archive = buildResult.archive;
        } catch (error) {
          log.error('😢 Failed to create Portal Template bundle:', error);
          process.exit(1);
        }
      }

      if (!archive) {
        log.error('😢 No bundle provided or created. Please specify a bundle file.');
        process.exit(1);
      }

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
      const uploadResult = await uploadPortalBundle({
        log,
        framework,
        fileOrBundle: archive,
      }).catch((error) => {
        log.error('😢 Failed to upload Portal Template bundle:', error);
        process.exit(1);
      });
      log.succeed('🚀 Upload completed');
      log.debug('Upload result:', uploadResult);

      log.start('🏷️ Tagging Portal Template...');
      await tagPortal({
        tag: options.tag,
        name: uploadResult.name,
        version: uploadResult.version,
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
