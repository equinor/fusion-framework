import { createCommand } from 'commander';

import { bundleApp, ConsoleLogger } from '@equinor/fusion-framework-cli/bin';

export const DEFAULT_ARCHIVE = 'app-bundle.zip' as const;

/**
 * CLI command: `pack`
 *
 * Creates a distributable app bundle of the application.
 *
 * Features:
 * - Bundles all necessary files for deployment.
 * - Output filename and directory can be specified.
 * - Optionally provide a manifest file to customize the bundle.
 * - If no manifest is provided, defaults to app.manifest.[ts|js|json] in the current directory.
 * - Supports `--snapshot` flag to generate a snapshot version without modifying package.json.
 *
 * Usage:
 *   $ ffc app pack [manifest] [options]
 *   $ ffc app pack --snapshot
 *   $ ffc app pack --snapshot pr-123
 *
 * Arguments:
 *   [manifest]           Manifest file to use for bundling (e.g., app.manifest.ts)
 *
 * Options:
 *   -a, --archive        Name of the output archive file (default: app-bundle.zip)
 *   -o, --output         Directory where the archive will be saved (default: current working directory)
 *   -d, --debug          Enable debug mode for verbose logging
 *   -s, --snapshot       Generate a snapshot version (optionally with custom identifier)
 *
 * Example:
 *   $ ffc app pack
 *   $ ffc app pack app.manifest.dev.ts --archive my-app.zip --output ./dist
 *   $ ffc app pack --snapshot
 *   $ ffc app pack --snapshot pr-456
 *
 * @see bundleApp for implementation details
 */
export const command = createCommand('pack')
  .description('Create a distributable app bundle of the application.')
  .addHelpText(
    'after',
    [
      '',
      'If no manifest is provided, a default app.manifest(.$ENV)?.[ts|js|json] is used from the current directory.',
      'example: `ffc app pack --env prod` will search for `app.manifest.prod.ts` then fallback to `app.manifest.ts`',
      '',
      'NOTE: app manifest is not required, a default manifest will be generated if not provided',
      '',
      'SNAPSHOT VERSIONS:',
      '  Use --snapshot to generate snapshot versions without modifying package.json:',
      '  - `ffc app pack --snapshot` → version-snapshot.{unix_timestamp}',
      '  - `ffc app pack --snapshot pr-123` → version-pr-123.{unix_timestamp}',
      '',
      'Examples:',
      '  $ ffc app pack',
      '  $ ffc app pack app.manifest.dev.ts --archive my-app.zip --output ./dist',
      '  $ ffc app pack --snapshot',
      '  $ ffc app pack --snapshot pr-456',
    ].join('\n'),
  )
  .option(
    '-a, --archive [string]',
    'Name of the output archive file (default: app-bundle.zip)',
    DEFAULT_ARCHIVE,
  )
  .option(
    '-o, --output [string]',
    'Directory where the archive will be saved (default: current working directory)',
    process.cwd(),
  )
  .option('-d, --debug', 'Enable debug mode for verbose logging', false)
  .option(
    '-s, --snapshot [identifier]',
    'Generate a snapshot version (optionally with custom identifier). The identifier defaults to "snapshot" if not provided.',
  )
  .argument('[manifest]', 'Manifest file to use for bundling (e.g., app.manifest.ts)')
  .action(async (manifest, options) => {
    const log = new ConsoleLogger('app:pack', {
      debug: options.debug,
    });
    await bundleApp({
      log,
      manifest,
      archive: options.archive,
      snapshot: options.snapshot,
    }).catch((error) => {
      log.error('Failed to create package:', error);
      process.exit(1);
    });
  });

export default command;
