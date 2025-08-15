import { createCommand } from 'commander';

import { ConsoleLogger, buildApplication } from '@equinor/fusion-framework-cli/bin';

/**
 * CLI command: `build`
 *
 * Builds the application using a manifest file and environment-specific configuration.
 *
 * Features:
 * - If no manifest is provided, searches for a default `app.manifest.[ts|js|json]` in the current directory.
 * - Supports environment variables to customize the build process.
 * - Provides a debug mode for verbose logging.
 *
 * Usage:
 *   $ fusion build
 *   $ fusion build app.manifest.dev.ts --debug
 *
 * Arguments:
 *   [manifest]   Manifest file to use for building (e.g., app.manifest.ts)
 *
 * Options:
 *   -d, --debug  Enable debug mode for verbose logging (default: false)
 *
 * Example:
 *   $ fusion build app.manifest.dev.ts --debug
 *
 * @see buildApplication for build implementation details
 */
export const command = createCommand('build')
  .description(
    'Build the application using a manifest file and environment-specific configuration.',
  )
  .addHelpText(
    'after',
    [
      'Builds the application using a manifest file and environment-specific configuration.',
      'If no manifest is provided, searches for a default app.manifest.[ts|js|json] in the current directory.',
      'You can use environment variables to customize the build process.',
      '',
      'Arguments:',
      '  [manifest]   Manifest file to use for building (e.g., app.manifest.ts)',
      '',
      'Options:',
      '  -d, --debug  Enable debug mode for verbose logging (default: false)',
      '',
      'Examples:',
      '  $ fusion build',
      '  $ fusion build app.manifest.dev.ts --debug',
    ].join('\n'),
  )
  .option('-d, --debug', 'Enable debug mode for verbose logging', false)
  .argument('[manifest]', 'Manifest file to use for building (e.g., app.manifest.ts)')
  .action(async (manifest, opt) => {
    const log = new ConsoleLogger('app:build', { debug: opt.debug });
    await buildApplication({ log, manifest });
  });

export default command;
