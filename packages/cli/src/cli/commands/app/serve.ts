import { createCommand } from 'commander';

import { ConsoleLogger, serveApplication } from '@equinor/fusion-framework-cli/bin';

/**
 * CLI command: `serve`
 *
 * Serves a built application using the dev-portal.
 *
 * Features:
 * - Serves the built application through the dev-portal (similar to dev command).
 * - Automatically detects the build directory from Vite configuration.
 * - Supports custom port, host, directory, manifest, and config options.
 * - Provides a debug mode for verbose logging.
 *
 * Usage:
 *   $ ffc app serve
 *   $ ffc app serve --port 5000
 *   $ ffc app serve --dir ./dist --host 0.0.0.0
 *
 * Options:
 *   --port <port>        Port for the preview server (default: 4173)
 *   --host <host>        Host for the preview server (default: localhost)
 *   --dir <directory>    Directory to serve (default: detected from build config)
 *   --manifest <path>    Path to the app manifest file
 *   --config <path>      Path to the app config file
 *   -d, --debug          Enable debug mode for verbose logging
 *
 * Example:
 *   $ ffc app serve
 *   $ ffc app serve --port 5000 --host 0.0.0.0
 *   $ ffc app serve --dir ./dist
 *   $ ffc app serve --manifest app.manifest.prod.ts --config app.config.prod.ts
 *
 * @see serveApplication for implementation details
 */
export const command = createCommand('serve')
  .description('Serve a built application')
  .addHelpText(
    'after',
    [
      '',
      'Serves the built application through the dev-portal, providing a production-like',
      'preview environment with the same portal interface as the dev command.',
      '',
      'The build directory is automatically detected from your Vite configuration.',
      'If you need to serve a different directory, use the --dir option.',
      '',
      'NOTE: The application must be built first using `ffc app build`.',
      '',
      'Examples:',
      '  $ ffc app serve',
      '  $ ffc app serve --port 5000',
      '  $ ffc app serve --dir ./dist --host 0.0.0.0',
      '  $ ffc app serve --manifest app.manifest.prod.ts --config app.config.prod.ts',
    ].join('\n'),
  )
  .option('--port <port>', 'Port for the preview server', '4173')
  .option('--host <host>', 'Host for the preview server', 'localhost')
  .option('--dir <directory>', 'Directory to serve (default: detected from build config)')
  .option('--manifest <path>', 'Path to the app manifest file')
  .option('--config <path>', 'Path to the app config file')
  .option('-d, --debug', 'Enable debug mode for verbose logging', false)
  .action(async (options) => {
    const log = new ConsoleLogger('app:serve', { debug: options.debug });

    const port = options.port ? parseInt(options.port, 10) : undefined;
    if (port && (Number.isNaN(port) || port < 1 || port > 65535)) {
      log.fail('Invalid port number. Port must be between 1 and 65535.');
      process.exit(1);
    }

    await serveApplication({
      log,
      manifest: options.manifest,
      config: options.config,
      dir: options.dir,
      port,
      host: options.host,
      debug: options.debug,
    });
  });

export default command;
