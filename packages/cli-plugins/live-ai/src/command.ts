import { createCommand, createOption } from 'commander';
import { startServer } from '@equinor/fusion-framework-cli-plugin-ai-studio';

interface ServeOptions {
  /** Optional explicit root directory for file operations. */
  root?: string;
  /** WebSocket port for ai-studio server. */
  port: number;
}

/**
 * `ai-studio serve` command.
 *
 * Starts the local ai-studio write server with a manually applied change-set flow.
 */
export const serveCommand = createCommand('serve')
  .description('Start the experimental local ai-studio write server')
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

    console.log(`ai-studio server listening on ws://localhost:${server.port}/ws`);
    console.log(`ai-studio root: ${server.root}`);

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
 * Root command group for all ai-studio commands.
 */
export const command = createCommand('ai-studio')
  .alias('live-ai')
  .description('Experimental Copilot-like ai-studio editing commands')
  .addCommand(serveCommand);

export default command;
