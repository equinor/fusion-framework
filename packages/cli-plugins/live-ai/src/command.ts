import { createCommand, createOption } from 'commander';
import { startServer } from '@equinor/fusion-framework-cli-plugin-live-ai-core';

interface ServeOptions {
  /** Optional explicit root directory for file operations. */
  root?: string;
  /** WebSocket port for live-ai server. */
  port: number;
}

/**
 * `live-ai serve` command.
 *
 * Starts the local live-ai write server with a manually applied change-set flow.
 */
export const serveCommand = createCommand('serve')
  .description('Start the experimental local live-ai write server')
  .addOption(
    createOption('--port <number>', 'WebSocket port to bind')
      .default(8787)
      .argParser((value) => {
        const parsed = Number.parseInt(value, 10);
        if (!Number.isFinite(parsed) || parsed <= 0) {
          throw new Error('--port must be a positive integer');
        }
        return parsed;
      }),
  )
  .addOption(createOption('--root <path>', 'Optional explicit root path for safe writes'))
  .action(async (options: ServeOptions) => {
    const server = await startServer({
      port: options.port,
      root: options.root,
    });

    console.log(`live-ai server listening on ws://localhost:${server.port}/ws`);
    console.log(`live-ai root: ${server.root}`);

    const shutdown = async () => {
      await server.close();
      process.exit(0);
    };

    process.on('SIGINT', () => {
      void shutdown();
    });

    process.on('SIGTERM', () => {
      void shutdown();
    });
  });

/**
 * Root command group for all live-ai commands.
 */
export const command = createCommand('live-ai')
  .description('Experimental Copilot-like live editing commands')
  .addCommand(serveCommand);

export default command;
