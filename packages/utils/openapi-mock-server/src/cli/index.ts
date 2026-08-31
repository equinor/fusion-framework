#!/usr/bin/env node
import { createMockServer } from '../server/index.js';
import { parseCliOptions } from './parse-cli-options.js';

/**
 * CLI entry point: `fusion-mock [--preset=<name>] [dir...] [--port <n>]`.
 *
 * @remarks
 * Accepts one or more bundled preset names (`--preset=fusion`) and/or
 * directories, in ascending precedence by argv order — later sources
 * override earlier ones' services by key. Defaults to `./mocks` alone, and
 * keeps the server running in the foreground until `SIGINT`/`SIGTERM`, so it
 * dies with whatever started it (e.g. Playwright's `webServer`) rather than
 * lingering as an orphaned process.
 *
 * @example
 * ```bash
 * fusion-mock --preset=fusion ./mocks --port 4010 --seed 42
 * ```
 */
async function main(): Promise<void> {
  const { port, seed, sources } = parseCliOptions(process.argv.slice(2));

  const server = createMockServer({ seed });
  // later sources override earlier ones' services by key, so registration order matters
  for (const source of sources) {
    server.use(source);
  }

  const { url } = await server.start({ port });
  console.log(`fusion-mock listening at ${url}`);

  const shutdown = (): void => {
    void server.close().finally(() => process.exit(0));
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
