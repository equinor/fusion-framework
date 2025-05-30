import { createCommand } from 'commander';

import { ConsoleLogger } from '../../../bin/utils';
import { startPortalDevServer } from '../../../bin/portal-dev.js';

export const command = createCommand('dev')
  .description(
    [
      'Start the Fusion portal in development mode with live reloading and custom port support.',
      '',
      'This command launches a local development server for the portal, enabling rapid development and testing.',
      'You can specify the port and enable debug mode for verbose logging.',
      '',
      'Examples:',
      '  $ fusion portal dev',
      '  $ fusion portal dev --port 4000 --debug',
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
