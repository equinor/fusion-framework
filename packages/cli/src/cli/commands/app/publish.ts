import { createCommand } from 'commander';

import type AdmZip from 'adm-zip';

import {
  initializeFramework,
  bundleApp,
  ConsoleLogger,
  uploadApplication,
  tagApplication,
  AllowedAppTags,
} from '@equinor/fusion-framework-cli/bin';

import { withAuthOptions } from '../../options/auth.js';
import { createEnvOption } from '../../options/env.js';

/**
 * CLI command: `publish`
 *
 * Uploads and tags a Fusion application for deployment to the Fusion portal.
 *
 * Features:
 * - Uploads the app bundle to the Fusion app store and applies a tag for versioning.
 * - Builds the app first if no bundle is provided.
 * - Supports specifying environment, manifest file, and tag.
 * - Debug mode and authentication options are supported.
 *
 * Usage:
 *   $ ffc app publish [bundle] [options]
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
 *   $ ffc app publish
 *   $ ffc app publish --env prod --manifest app.manifest.prod.ts
 *   $ ffc app publish --tag latest app.bundle.zip
 *
 * @see uploadApplication, tagApplication for implementation details
 */
export const command = withAuthOptions(
  createCommand('publish')
    .description(
      'Deployment: Upload and tag your Fusion application (builds if no bundle provided).',
    )
    .addHelpText(
      'after',
      [
        '',
        'WHAT THIS COMMAND DOES:',
        '  1. Builds your application (if no bundle provided)',
        '  2. Uploads the bundle to Fusion app registry',
        '  3. Tags the uploaded version for deployment',
        '',
        'If no manifest is provided, a default app.manifest(.$ENV)?.[ts|js|json] is used from the current directory.',
        'example: `ffc app publish --env prod` will search for `app.manifest.prod.ts` then fallback to `app.manifest.ts`',
        '',
        'NOTE: app manifest is not required, a default manifest will be generated if not provided',
        '',
        'FIRST TIME PUBLISHING:',
        '  - Ensure your app is registered in Fusion App Admin',
        '  - Use `ffc app check` first to verify registration status',
        '  - Start with a test environment before production',
        '',
        'Examples:',
        '  $ ffc app publish',
        '  $ ffc app publish --env prod --manifest app.manifest.prod.ts',
        '  $ ffc app publish --tag latest app.bundle.zip',
      ].join('\n'),
    )
    .option('-d, --debug', 'Enable debug mode for verbose logging', false)
    .addOption(createEnvOption({ allowDev: false }))
    .option('-m, --manifest [string]', 'Manifest file to use for bundling (e.g., app.manifest.ts)')
    .option(
      '-t, --tag [string]',
      `Tag to apply to the published app (${Object.values(AllowedAppTags).join(' | ')})`,
      AllowedAppTags.Latest,
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
