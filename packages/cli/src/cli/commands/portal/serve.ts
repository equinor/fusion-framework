import { createCommand } from 'commander';

import { ConsoleLogger, servePortal } from '@equinor/fusion-framework-cli/bin';

/**
 * CLI command: `serve`
 *
 * Serves a built portal template using the dev server in preview mode.
 *
 * Features:
 * - Serves the built portal through the dev server.
 * - Automatically detects the build directory from Vite configuration.
 * - Supports custom port, host, directory, manifest, and config options.
 * - Provides a debug mode for verbose logging.
 *
 * Usage:
 *   $ ffc portal serve
 *   $ ffc portal serve --port 5000
 *   $ ffc portal serve --dir ./dist --host 0.0.0.0
 *
 * Options:
 *   --port <port>        Port for the preview server (default: 4173)
 *   --host <host>        Host for the preview server (default: localhost)
 *   --dir <directory>    Directory to serve (default: detected from build config)
 *   --manifest <path>    Path to the portal manifest file
 *   --config <path>      Path to the portal config file
 *   -d, --debug          Enable debug mode for verbose logging
 *
 * Example:
 *   $ ffc portal serve
 *   $ ffc portal serve --port 5000 --host 0.0.0.0
 *   $ ffc portal serve --dir ./dist
 *
 * @see servePortal for implementation details
 */
export const command = createCommand('serve')
  .description('Serve a built portal template')
  .addHelpText(
    'after',
    [
      '',
      'Serves the built portal through the dev server, providing a production-like',
      'preview environment.',
      '',
      'The build directory is automatically detected from your Vite configuration.',
      'If you need to serve a different directory, use the --dir option.',
      '',
      'NOTE: The portal must be built first using `ffc portal build`.',
      '',
      'Examples:',
      '  $ ffc portal serve',
      '  $ ffc portal serve --port 5000',
      '  $ ffc portal serve --dir ./dist --host 0.0.0.0',
    ].join('\n'),
  )
  .option('--port <port>', 'Port for the preview server', '4173')
  .option('--host <host>', 'Host for the preview server', 'localhost')
  .option('--dir <directory>', 'Directory to serve (default: detected from build config)')
  .option('--manifest <path>', 'Path to the portal manifest file')
  .option('--config <path>', 'Path to the portal config file')
  .option('-d, --debug', 'Enable debug mode for verbose logging', false)
  .action(async (options) => {
    const log = new ConsoleLogger('portal:serve', { debug: options.debug });

    const port = options.port ? parseInt(options.port, 10) : undefined;
    if (port && (Number.isNaN(port) || port < 1 || port > 65535)) {
      log.fail('Invalid port number. Port must be between 1 and 65535.');
      process.exit(1);
    }

    await servePortal({
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
