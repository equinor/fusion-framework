import { createCommand } from 'commander';
import { ConsoleLogger, buildPortal } from '@equinor/fusion-framework-cli/bin';

/**
 * CLI command: `build`
 *
 * Builds the Fusion portal using a manifest file and environment-specific configuration.
 *
 * Features:
 * - If no manifest is provided, searches for a default `portal.manifest.[ts|js|json]` in the current directory.
 * - Supports environment variables to customize the build process.
 * - Provides a debug mode for verbose logging.
 *
 * Usage:
 *   $ ffc portal build
 *   $ ffc portal build portal.manifest.prod.ts --debug
 *
 * Arguments:
 *   [manifest]   Manifest file to use for building (e.g., portal.manifest.ts)
 *
 * Options:
 *   -d, --debug  Enable debug mode for verbose logging (default: false)
 *
 * Example:
 *   $ ffc portal build portal.manifest.prod.ts --debug
 *
 * @see buildPortal for build implementation details
 */
export const command = createCommand('build')
  .description('Build the Fusion portal from a manifest file with environment-specific settings.')
  .addHelpText(
    'after',
    [
      '',
      'If no manifest is provided, the command will search for a default portal.manifest.[ts|js|json] in the current directory.',
      'example: `ffc portal build --env prod` will search for `portal.manifest.prod.ts` then fallback to `portal.manifest.ts`',
      '',
      'NOTE: portal manifest is not required, a default manifest will be generated if not provided',
      '',
      'Examples:',
      '  $ ffc portal build',
      '  $ ffc portal build portal.manifest.prod.ts --debug',
      '',
    ].join('\n'),
  )
  .option('-d, --debug', 'Enable debug mode for verbose logging', false)
  .argument(
    '[manifest]',
    'Manifest build file to use for building (e.g., portal.manifest[.env]?.[ts|js|json])',
  )
  .action(async (manifest, opt) => {
    const log = new ConsoleLogger('portal:build', { debug: opt.debug });
    await buildPortal({ log, manifest });
  });

export default command;
