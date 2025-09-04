import { createCommand } from 'commander';
import { ConsoleLogger, bundlePortal } from '@equinor/fusion-framework-cli/bin';

/**
 * CLI command: `pack`
 *
 * Bundles the Fusion portal into a deployable archive.
 *
 * Features:
 * - If no manifest is provided, a default portal.manifest(.$ENV)?.[ts|js|json] is used from the current directory.
 * - Supports environment variables to customize the build process.
 * - Provides a debug mode for verbose logging.
 *
 * Usage:
 *   $ ffc portal pack [manifest] [options]
 *
 * Arguments:
 *   [manifest]   Manifest file to use for bundling (e.g., portal.manifest.ts)
 *
 * Options:
 *   -d, --debug  Enable debug mode for verbose logging (default: false)
 *
 * Example:
 *   $ ffc portal pack portal.manifest.prod.ts --debug
 *
 * @see bundlePortal for build implementation details
 */
export const command = createCommand('pack')
  .description('Bundle the Fusion portal into a deployable archive.')
  .addHelpText(
    'after',
    [
      '',
      'If no manifest is provided, a default portal.manifest(.$ENV)?.[ts|js|json] is used from the current directory.',
      'example: `ffc portal pack --env prod` will search for `portal.manifest.prod.ts` then fallback to `portal.manifest.ts`',
      '',
      'NOTE: portal manifest is not required, a default manifest will be generated if not provided',
      '',
      'Examples:',
      '  $ ffc portal pack',
      '  $ ffc portal pack portal.manifest.dev.ts --archive my-portal.zip --output ./dist',
    ].join('\n'),
  )
  .option(
    '-a, --archive [string]',
    'Name of the output archive file (default: out/bundle.zip)',
    'out/bundle.zip',
  )
  .option('-d, --debug [boolean]', 'Enable debug mode for verbose logging', false)
  .option('--schema [string]', 'Schema file to use for validation')
  .argument('[manifest]', 'Manifest file to use for bundling (e.g., my-portal.manifest.ts)')
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
