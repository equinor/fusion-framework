import { createCommand } from 'commander';

import { ConsoleLogger, startPortalDevServer } from '@equinor/fusion-framework-cli/bin';

/**
 * CLI command: `dev`
 *
 * Starts the portal in development mode with a local dev server.
 *
 * Features:
 * - Launches the development server for your portal.
 * - Supports custom runtime environment and port selection.
 * - Debug mode available for verbose logging.
 *
 * Usage:
 *   $ ffc portal dev [options]
 *
 * Options:
 *   --debug              Enable debug mode
 *   --env <environment>  Runtime environment for the dev server (default: local)
 *   --port <port>        Port for the development server (default: 3000)
 *
 * Example:
 *   $ ffc portal dev
 *   $ ffc portal dev --port 4000
 *   $ ffc portal dev --debug
 *
 * @see startPortalDevServer for implementation details
 */
export const command = createCommand('dev')
  .description('Start a local development server for the Fusion portal.')
  .addHelpText(
    'after',
    [
      '',
      'Examples:',
      '  $ ffc portal dev',
      '  $ ffc portal dev --port 4000',
      '  $ ffc portal dev --debug',
    ].join('\n'),
  )
  .option('--debug', 'Enable debug mode')
  .option('--env <environment>', 'Runtime environment for the dev server', 'local')
  .option('--port <port>', 'Port for the development server', '3000')
  .action(async (options) => {
    const log = new ConsoleLogger('portal:dev', { debug: options.debug });

    log.start('Starting portal in development mode...');
    startPortalDevServer({
      server: { port: Number(options.port) },
      log,
      env: options.env,
    });
    log.succeed('Development server started successfully.');
  });

export default command;
