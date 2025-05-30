import { createCommand } from 'commander';
import { ConsoleLogger } from '../../../bin/utils';

import { bundlePortal } from '../../../bin';

export const command = createCommand('pack')
  .description(
    [
      'Create a distributable bundle of the Fusion portal application for deployment.',
      '',
      'This command packages the portal app, allowing you to specify the output archive, manifest, and schema files.',
      'Supports debug mode for verbose logging.',
      '',
      'Examples:',
      '  $ fusion portal pack',
      '  $ fusion portal pack --archive my-portal.zip --schema portal.schema.json',
      '  $ fusion portal pack app.manifest.prod.ts --debug',
    ].join('\n'),
  )
  .option(
    '-a, --archive [string]',
    'Name of the output archive file (default: out/bundle.zip)',
    'out/bundle.zip',
  )
  .option('-d, --debug [boolean]', 'Enable debug mode for verbose logging', false)
  .option('--schema [string]', 'Schema file to use for validation')
  .argument(
    '[manifest]',
    'Manifest file to use for bundling (e.g., app.manifest[.env]?.[ts,js,json])',
  )
  .action(async (manifest, options) => {
    const log = new ConsoleLogger('portal:pack', {
      debug: options.debug,
    });
    await bundlePortal({
      log,
      manifest,
      archive: options.archive,
      schema: options.schema,
    }).catch((error) => {
      log.error('Failed to create package:', error);
      process.exit(1);
    });
  });

export default command;
