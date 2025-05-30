import { createCommand } from 'commander';

import type AdmZip from 'adm-zip';

import { withAuthOptions } from '../../options/auth.js';
import { createEnvOption } from '../../options/env.js';

import { bundleApp } from '../../../bin';
import { initializeFramework } from '../../../lib';

import { ConsoleLogger } from '../../../bin/utils/ConsoleLogger.js';

import { uploadApplication } from '../../../bin/app-upload.js';

import { tagApplication, AllowedTags } from '../../../bin/app-tag.js';

/**
 * CLI command: `publish`
 *
 * Builds, uploads, and tags a Fusion application for deployment to the Fusion portal.
 *
 * Features:
 * - Bundles the app, uploads it to the Fusion app store, and applies a tag for versioning.
 * - Supports specifying environment, manifest file, and tag.
 * - Debug mode and authentication options are supported.
 *
 * Usage:
 *   $ fusion publish [bundle] [options]
 *
 * Arguments:
 *   [bundle]             Path to the app bundle to upload
 *
 * Options:
 *   -d, --debug          Enable debug mode for verbose logging (default: false)
 *   -e, --env <env>      Target environment
 *   -m, --manifest       Manifest file to use for bundling (e.g., app.manifest.ts)
 *   -t, --tag            Tag to apply to the published app (latest | preview)
 *
 * Example:
 *   $ fusion publish
 *   $ fusion publish --env prod --manifest app.manifest.prod.ts
 *   $ fusion publish --tag latest app.bundle.zip
 *
 * @see uploadApplication, tagApplication for implementation details
 */
export const command = withAuthOptions(
  createCommand('publish')
    .description(
      [
        'Build, upload, and tag your Fusion application for deployment to the Fusion portal.',
        '',
        'This command bundles your app, uploads it to the Fusion app store, and applies a tag for versioning.',
        'You can specify the environment, manifest file, and tag to use. Debug mode and authentication options are supported.',
        '',
        'Examples:',
        '  $ fusion publish',
        '  $ fusion publish --env prod --manifest app.manifest.prod.ts',
        '  $ fusion publish --tag latest app.bundle.zip',
      ].join('\n'),
    )
    .option('-d, --debug', 'Enable debug mode for verbose logging', false)
    .addOption(createEnvOption({ allowDev: false }))
    .option('-m, --manifest [string]', 'Manifest file to use for bundling (e.g., app.manifest.ts)')
    .option(
      '-t, --tag [string]',
      `Tag to apply to the published app (${Object.values(AllowedTags).join(' | ')})`,
      AllowedTags.Latest,
    )
    .argument('[bundle]', 'Path to the app bundle to upload')
    .action(async (bundle, options) => {
      const log = new ConsoleLogger('app:publish', {
        debug: options.debug,
      });

      let archive: string | AdmZip;
      if (bundle) {
        log.info(`📦 Using provided bundle: ${bundle}`);
        archive = bundle;
      } else {
        try {
          log.start('📦 Bundle application...');
          const buildResult = await bundleApp({
            log,
            manifest: options.manifest,
          });
          archive = buildResult.archive;
          log.succeed('📦 Bundle completed');
        } catch (error) {
          log.error('😢 Failed to bundle application:', error);
          process.exit(1);
        }
      }

      if (!archive) {
        log.error('😢 No bundle provided or created. Please specify a bundle file.');
        process.exit(1);
      }

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

      log.start('🚀 Uploading application...');
      const uploadResult = await uploadApplication({
        log,
        framework,
        fileOrBundle: archive,
      }).catch((error) => {
        log.error('😢 Failed to upload bundle:', error);
        process.exit(1);
      });
      log.succeed('🚀 Upload completed');
      log.debug('Upload result:', uploadResult);

      log.start('🏷️ Tagging application...');
      const tagResult = await tagApplication({
        tag: options.tag,
        appKey: uploadResult.name,
        version: uploadResult.version,
        log,
        framework,
      }).catch((error) => {
        log.error('😢 Failed to tag application:', error);
        process.exit(1);
      });
      log.succeed('Tagging completed');
      log.debug('Tagging result:', tagResult);
    }),
);

export default command;
