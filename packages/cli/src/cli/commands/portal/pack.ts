import { createCommand } from 'commander';
import { ConsoleLogger } from '../../../bin/utils';

import { bundlePortal } from '../../../bin';

export const command = createCommand('pack')
  .description('Bundle the Fusion portal into a deployable archive.')
  .addHelpText(
    'after',
    [
      'Bundles the Fusion portal using the provided manifest and schema into a zip archive for deployment.',
      '',
      'If no manifest is provided, a default portal.manifest.[ts|js|json] is used from the current directory.',
      '',
      'Options:',
      '  -a, --archive   Name of the output archive file (default: out/bundle.zip)',
      '  --schema       Schema file to use for validation',
      '  -d, --debug    Enable debug mode for verbose logging',
      '',
      'Examples:',
      '  $ fusion-framework-cli portal pack',
      '  $ fusion-framework-cli portal pack --archive my-portal.zip --schema portal.schema.json',
      '  $ fusion-framework-cli portal pack portal.manifest.prod.ts --debug',
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
    'Manifest file to use for bundling (e.g., portal.manifest[.env]?.[ts,js,json])',
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
