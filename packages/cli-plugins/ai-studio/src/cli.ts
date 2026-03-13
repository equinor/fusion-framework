#!/usr/bin/env node

import { startServer } from './index.js';

interface CliArgs {
  port?: number;
  root?: string;
}

/**
 * Parses CLI arguments for standalone live-ai server usage.
 *
 * @param argv - Raw command line args from process.argv.
 * @returns Parsed options.
 */
function parseArgs(argv: string[]): CliArgs {
  const parsed: CliArgs = {};

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--port') {
      const value = argv[index + 1];
      const asNumber = Number.parseInt(value ?? '', 10);
      if (!Number.isFinite(asNumber)) {
        throw new Error('--port must be a valid number');
      }
      parsed.port = asNumber;
      index += 1;
      continue;
    }

    if (arg === '--root') {
      const value = argv[index + 1];
      if (!value) {
        throw new Error('--root requires a path value');
      }
      parsed.root = value;
      index += 1;
    }
  }

  return parsed;
}

/**
 * Runs the standalone live-ai server CLI.
 */
async function run(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  const server = await startServer({
    port: args.port,
    root: args.root,
  });

  console.log(
    `live-ai server listening on ws://localhost:${server.port}/ws (root: ${server.root})`,
  );

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
}

void run().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : 'Failed to start live-ai server');
  process.exit(1);
});
