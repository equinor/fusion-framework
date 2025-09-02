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
 *
 * Usage:
 *   $ fusion app dev [options]
 *
 * Options:
 *   --debug              Enable debug mode
 *   --manifest <path>    Path to the app manifest file (app.manifest[.env]?.[ts,js,json])
 *   --config <path>      Path to the app config file (app.config[.env]?.[ts,js,json])
 *   --env <environment>  Runtime environment for the dev server (default: local)
 *   --port <port>        Port for the development server (default: 3000)
 *
 * Example:
 *   $ fusion app dev
 *   $ fusion app dev --port 4000
 *   $ fusion app dev --manifest ./app.manifest.local.ts --config ./app.config.ts
 *
 * @see startAppDevServer for implementation details
 */
export const command = createCommand('dev')
  .description('Start the application in development mode.')
  .addHelpText(
    'after',
    [
      '',
      'Starts the application in development mode with a local dev server.',
      '',
      'Options:',
      '  --debug              Enable debug mode',
      '  --manifest <path>    Path to the app manifest file (app.manifest[.env]?.[ts,js,json])',
      '  --config <path>      Path to the app config file (app.config[.env]?.[ts,js,json])',
      '  --env <environment>  Runtime environment for the dev server (default: local)',
      '  --port <port>        Port for the development server (default: 3000)',
      '',
      'Examples:',
      '  $ fusion app dev',
      '  $ fusion app dev --port 4000',
      '  $ fusion app dev --manifest ./app.manifest.local.ts --config ./app.config.ts',
    ].join('\n'),
  )
  .option('--debug', 'Enable debug mode')
  .option('--manifest <path>', 'Path to the app manifest file (app.manifest[.env]?.[ts,js,json])')
  .option('--config <path>', 'Path to the app config file (app.config[.env]?.[ts,js,json])')
  .option('--env <environment>', 'Runtime environment for the dev server', 'local')
  .option('--port <port>', 'Port for the development server', '3000')
  .action(async (options) => {
    const log = new ConsoleLogger('app:dev', { debug: options.debug });

    log.start('Starting application in development mode...');
    startAppDevServer({
      log,
      manifest: options.manifest,
      config: options.config,
      env: options.env,
      port: options.port,
    });
    log.succeed('Development server started successfully.');
  });

export default command;
