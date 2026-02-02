import { createCommand } from 'commander';

import type AdmZip from 'adm-zip';

import {
  initializeFramework,
  bundleApp,
  ConsoleLogger,
  uploadApplication,
  tagApplication,
  checkApp,
  generateApplicationConfig,
  publishAppConfig,
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
 * - Supports `--snapshot` flag to publish with a snapshot version without modifying package.json.
 *
 * Usage:
 *   $ ffc app publish [bundle] [options]
 *   $ ffc app publish --snapshot
 *   $ ffc app publish --snapshot pr-123
 *
 * Arguments:
 *   [bundle]             Path to the app bundle to upload
 *
 * Options:
 *   -d, --debug          Enable debug mode for verbose logging (default: false)
 *   -e, --env <env>      Target environment
 *   -m, --manifest       Manifest file to use for bundling (e.g., app.manifest.ts)
 *   -t, --tag            Tag to apply to the published app (e.g. latest | preview | pr-1234)
 *   -s, --snapshot       Build with snapshot version (optionally with custom identifier)
 *
 * Example:
 *   $ ffc app publish
 *   $ ffc app publish --env prod --manifest app.manifest.prod.ts
 *   $ ffc app publish --tag latest app.bundle.zip
 *   $ ffc app publish --snapshot
 *   $ ffc app publish --snapshot pr-456
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
        '  1. Validates app registration (using bundle metadata if provided, or local files)',
        '  2. Builds your application (if no bundle provided)',
        '  3. Uploads the bundle to Fusion app registry',
        '  4. Tags the uploaded version for deployment',
        '',
        'If no manifest is provided, a default app.manifest(.$ENV)?.[ts|js|json] is used from the current directory.',
        'example: `ffc app publish --env prod` will search for `app.manifest.prod.ts` then fallback to `app.manifest.ts`',
        '',
        'NOTE: app manifest is not required, a default manifest will be generated if not provided',
        '',
        'SNAPSHOT VERSIONS:',
        '  Use --snapshot to publish with snapshot versions without modifying package.json:',
        '  - `ffc app publish --snapshot` → version-snapshot.{unix_timestamp}',
        '  - `ffc app publish --snapshot pr-123` → version-pr-123.{unix_timestamp}',
        '',
        'CONFIG UPLOAD:',
        '  Use --config to upload application configuration after publishing:',
        '  - `ffc app publish --config` → uploads default app.config.ts',
        '  - `ffc app publish --config app.config.prod.ts` → uploads specific config file',
        '',
        'FIRST TIME PUBLISHING:',
        '  - Ensure your app is registered in Fusion App Admin',
        '  - Use `ffc app check` first to verify registration status',
        '  - Start with a test environment before production',
        '',
        'ARTIFACT-BASED PUBLISHING:',
        '  When providing a bundle, app validation uses metadata from the bundle instead',
        '  of local files, enabling publishing from any directory (ideal for CI/CD).',
        '',
        'Examples:',
        '  $ ffc app publish',
        '  $ ffc app publish --env prod --manifest app.manifest.prod.ts',
        '  $ ffc app publish --tag latest app.bundle.zip',
        '  $ ffc app publish --snapshot',
        '  $ ffc app publish --snapshot pr-456',
        '  $ ffc app publish --config',
        '  $ ffc app publish --config app.config.prod.ts --env prod',
      ].join('\n'),
    )
    .option('-d, --debug', 'Enable debug mode for verbose logging', false)
    .addOption(createEnvOption({ allowDev: false }))
    .option('-m, --manifest [string]', 'Manifest file to use for bundling (e.g., app.manifest.ts)')
    .option(
      '-t, --tag [string]',
      'Tag to apply to the published app (e.g. latest | preview | next | pr-1234). Alphanumeric, dots and dashes allowed.',
      'latest',
    )
    .option(
      '-s, --snapshot [identifier]',
      'Build with a snapshot version (optionally with custom identifier). The identifier defaults to "snapshot" if not provided.',
    )
    .option(
      '-c, --config [path]',
      'Upload application config after publishing. Accepts true for default config file or a path to a specific config file.',
    )
    .argument('[bundle]', 'Path to the app bundle to upload')
    .action(async (bundle, options) => {
      const log = new ConsoleLogger('app:publish', {
        debug: options.debug,
      });

      // Check if the app is registered in the app store
      const appExists = await checkApp({
        log,
        environment: options.env,
        auth: 'token' in options ? { token: options.token } : options,
        bundle: typeof bundle === 'string' ? bundle : undefined,
      });

      // if the application is not registered in the app store, exit with error
      if (!appExists) {
        log.error('😢 App is not registered / deleted in app store');
        process.exit(1);
      }

      // Bundle the app if no bundle is provided
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
            snapshot: options.snapshot,
          });
          archive = buildResult.archive;
          log.succeed('📦 Bundle completed');
        } catch (error) {
          log.error('😢 Failed to bundle application:', error);
          process.exit(1);
        }
      }

      // Ensure we have an archive to upload
      if (!archive) {
        log.error('😢 No bundle provided or created. Please specify a bundle file.');
        process.exit(1);
      }

      log?.start(`💾 Initializing Fusion Framework - Environment: ${options.env}`);
      const framework = await initializeFramework({
        env: options.env,
        auth: {
          token: options.token,
          tenantId: options.tenantId,
          clientId: options.clientId,
        },
      });
      log?.succeed('💾 Initialized Fusion Framework');

      // Upload the application bundle
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

      // Tag the uploaded application version
      log.start('🏷️ Tagging application...');
      const tagResult = await tagApplication({
        tag: options.tag,
        appKey: uploadResult.appKey,
        version: uploadResult.version,
        log,
        framework,
      }).catch((error) => {
        log.error('😢 Failed to tag application:', error);
        process.exit(1);
      });
      log.succeed('Tagging completed');
      log.debug('Tagging result:', tagResult);

      // Upload application config if requested
      if (options.config) {
        try {
          log.start('📝 Generating application config...');
          const configPath = typeof options.config === 'string' ? options.config : undefined;
          const { config } = await generateApplicationConfig({
            log,
            config: configPath,
          });
          log.succeed('📝 Config generated');

          log.start('📤 Uploading application config...');
          await publishAppConfig({
            log,
            config,
            appKey: uploadResult.appKey,
            buildVersion: uploadResult.version,
            framework,
          });
          log.succeed('📤 Config uploaded successfully');
        } catch (error) {
          log.error('😢 Failed to upload config:', error);
          process.exit(1);
        }
      }
    }),
);

export default command;
