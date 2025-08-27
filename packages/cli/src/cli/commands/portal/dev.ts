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
  .option('-p, --port <number>', 'Port to run the development server on', '3000')
  .option('-d, --debug', 'Enable debug mode for verbose logging')
  .action(async (options) => {
    const log = new ConsoleLogger('portal:dev', { debug: options.debug });

    log.start('Starting application in development mode...');
    startPortalDevServer({ server: { port: Number(options.port) }, log });
    log.succeed('Development server started successfully.');
  });

export default command;
