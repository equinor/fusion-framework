import { createCommand } from 'commander';

import { startAppDevServer, ConsoleLogger } from '@equinor/fusion-framework-cli/bin';

/**
 * CLI command: `dev`
 *
 * Starts the application in development mode with a local dev server.
 *
 * Features:
 * - Launches the development server for your application.
 * - Supports custom manifest/config files, runtime environment, and port selection.
 * - Debug mode available for verbose logging.
 * - Automatic loading of dev-server.config.ts for API mocking and customization.
 *
 * Usage:
 *   $ ffc app dev [options]
 *
 * Options:
 *   --debug              Enable debug mode
 *   --manifest <path>    Path to the app manifest file (app.manifest[.env]?.[ts,js,json])
 *   --config <path>      Path to the app config file (app.config[.env]?.[ts,js,json])
 *   --env <environment>  Runtime environment for the dev server (default: local)
 *   --port <port>        Port for the development server (default: 3000)
 *   --host <host>        Host for the development server (default: localhost)
 *
 * Configuration:
 *   dev-server.config.ts  Optional configuration file for API mocking, service discovery,
 *                         and development environment customization
 *
 * Example:
 *   $ ffc app dev
 *   $ ffc app dev --port 4000
 *   $ ffc app dev --manifest ./app.manifest.local.ts --config ./app.config.ts
 *   $ ffc app dev --host 0.0.0.0
 *
 * @see startAppDevServer for implementation details
 * @see dev-server-config.md for configuration options
 */
export const command = createCommand('dev')
  .description('Start the application in development mode.')
  .addHelpText(
    'after',
    [
      '',
      'Configuration:',
      '  dev-server.config.ts  Optional configuration file for API mocking, service discovery,',
      '                         and development environment customization',
      '',
      'Examples:',
      '  $ ffc app dev',
      '  $ ffc app dev --port 4000',
      '  $ ffc app dev --manifest ./app.manifest.local.ts --config ./app.config.ts',
      '  $ ffc app dev --host 0.0.0.0',
      '',
      'See https://equinor.github.io/fusion-framework/cli/docs/dev-server-config.html for configuration options.',
    ].join('\n'),
  )
  .option('--debug', 'Enable debug mode')
  .option('--manifest <path>', 'Path to the app manifest file (app.manifest[.env]?.[ts,js,json])')
  .option('--config <path>', 'Path to the app config file (app.config[.env]?.[ts,js,json])')
  .option('--env <environment>', 'Runtime environment for the dev server', 'local')
  .option('--port <port>', 'Port for the development server', '3000')
  .option('--host <host>', 'Host for the development server')
  .action(async (options) => {
    const log = new ConsoleLogger('app:dev', { debug: options.debug });

    log.start('Starting application in development mode...');
    startAppDevServer({
      log,
      manifest: options.manifest,
      config: options.config,
      env: options.env,
      port: options.port,
      host: options.host,
    });
    log.succeed('Development server started successfully.');
  });

export default command;
