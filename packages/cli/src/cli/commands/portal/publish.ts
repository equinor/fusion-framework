import { createCommand } from 'commander';

import { withAuthOptions } from '../../options/auth.js';
import { createEnvOption } from '../../options/env.js';

import { ConsoleLogger } from '../../../bin/utils';

import { bundlePortal } from '../../../bin';

import { uploadPortalBundle } from '../../../bin/portal-upload.js';
import { tagPortal, AllowedTags } from '../../../bin/portal-tag.js';

import { initializeFramework } from '../../../lib/framework.node.js';
import chalk from 'chalk';

export const command = withAuthOptions(
  createCommand('publish')
    .description(
      [
        'Build, upload, and tag your Fusion portal bundle for deployment to the Fusion portal registry.',
        '',
        'This command bundles the portal, uploads it to the registry, and applies a tag for versioning.',
        'You can specify the environment, manifest file, schema, and tag. Debug mode and authentication options are supported.',
        '',
        'Examples:',
        '  $ fusion portal publish',
        '  $ fusion portal publish --env prod --manifest portal.manifest.prod.ts',
        '  $ fusion portal publish --tag latest --debug',
        '  $ fusion portal publish --schema portal.schema.json',
      ].join('\n'),
    )
    .option('-d, --debug', 'Enable debug mode for verbose logging', false)
    .addOption(createEnvOption({ allowDev: false }))
    .option(
      '-m, --manifest [string]',
      'Manifest file to use for bundling (e.g., portal.manifest.ts)',
    )
    .option('--schema [string]', 'Schema file to use for validation')
    .option(
      '-t, --tag [string]',
      `Tag to apply to the published portal (${Object.values(AllowedTags).join(' | ')})`,
      AllowedTags.Latest,
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
