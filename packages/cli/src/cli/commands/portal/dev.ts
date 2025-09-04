import { createCommand } from 'commander';

import { ConsoleLogger, startPortalDevServer } from '@equinor/fusion-framework-cli/bin';

export const command = createCommand('dev')
  .description('Start a local development server for the Fusion portal.')
  .addHelpText(
    'after',
    [
      '',
      'Starts a local development server for your Fusion portal.',
      '',
      'Options:',
      '  -p, --port   Port to run the development server on (default: 3000)',
      '  -d, --debug  Enable debug mode for verbose logging',
      '',
      'Examples:',
      '  $ fusion-framework-cli portal dev',
      '  $ fusion-framework-cli portal dev --port 4000 --debug',
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
