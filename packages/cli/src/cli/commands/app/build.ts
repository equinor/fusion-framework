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
 *   $ ffc app build app.manifest.dev.ts --debug
 *
 * @see buildApplication for build implementation details
 */
export const command = createCommand('build')
  .description('Build the application')
  .addHelpText(
    'after',
    [
      '',
      'If no manifest is provided, searches for a default app.manifest(.$ENV)?.[ts|js|json] in the current directory.',
      'example: `ffc app build --env prod` will search for `app.manifest.prod.ts` then fallback to `app.manifest.ts`',
      '',
      'NOTE: app manifest is not required, a default manifest will be generated if not provided',
      '',
      'OUTPUT LOCATION:',
      '  The build output location is determined by the `main` field in your package.json.',
      '  - "main": "dist/index.js" → outputs to dist/index.js',
      '  - "main": "build/app.js" → outputs to build/app.js',
      '  - No main field → defaults to dist/bundle.js',
      '  Output directory cannot be project root, src/, or current working directory.',
      '',
      'Examples:',
      '  $ ffc app build',
      '  $ ffc app build app.manifest.dev.ts --debug',
    ].join('\n'),
  )
  .option('-d, --debug', 'Enable debug mode for verbose logging', false)
  .argument('[manifest]', 'Manifest file to use for building (e.g., app.manifest.ts)')
  .action(async (manifest, opt) => {
    const log = new ConsoleLogger('app:build', { debug: opt.debug });
    await buildApplication({ log, manifest });
  });

export default command;
