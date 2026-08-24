import { createCommand, createOption, type Command } from 'commander';

import { createMockServer } from '@equinor/fusion-openapi-mock-server';

/** Option values for `ffc mock-server`. */
interface MockServerCommandOptions {
  /** Bundled preset names to layer in, lowest precedence first (e.g. `['fusion']`). */
  preset: string[];
  /** Port to listen on; `undefined` lets the OS assign a free one. */
  port?: number;
  /** Hostname to bind to. */
  host: string;
  /** Seeds every service's faked responses, if given. */
  seed?: number;
}

/** Overrides for `ffc mock-server`'s own built-in defaults, set by whoever registers the plugin. */
export interface MockServerCommandDefaults {
  /** Bundled preset(s) to apply when `--preset` isn't given at all. Defaults to `['fusion']`. */
  preset?: string[];
  /** Port to listen on when `--port` isn't given. Defaults to an OS-assigned free port. */
  port?: number;
  /** Hostname to bind to when `--host` isn't given. Defaults to `'localhost'`. */
  host?: string;
  /** Seed to apply when `--seed` isn't given. Defaults to unseeded (random) faked responses. */
  seed?: number;
}

/**
 * Builds the `ffc mock-server` command definition.
 *
 * Serves every service discovered from one or more directories of OpenAPI
 * specs (plus any bundled presets) over HTTP, using
 * `@equinor/fusion-openapi-mock-server`'s `createMockServer`. Presets and
 * directories are both layered in ascending precedence — a later `--preset`
 * or directory replaces an earlier one's services by key — with every
 * `--preset` applied before every positional directory, regardless of their
 * order on the command line.
 *
 * Defaults to the bundled `fusion` preset when `--preset` isn't given at
 * all — a Fusion app's default framework modules resolve several
 * service-discovery keys eagerly at startup and fail hard without them. The
 * first explicit `--preset` fully replaces that default rather than
 * appending to it; repeat the flag (`--preset=fusion --preset=other`) to
 * combine it with something else. Pass {@link defaults} to change any of
 * these built-in defaults (e.g. a fixed port for a specific app).
 *
 * Keeps the server running in the foreground until `SIGINT`/`SIGTERM`, so it
 * dies with whatever started it (e.g. Playwright's `webServer`) rather than
 * lingering as an orphaned process.
 *
 * @param defaults - Overrides for the command's own built-in `--preset`/`--port`/`--host` defaults.
 * @returns A fresh `Command` instance — a factory rather than a shared singleton, since
 * Commander stores parsed option values on the `Command` instance itself.
 *
 * @example
 * ```sh
 * ffc mock-server ./mocks --port 4010
 * ```
 */
export function createMockServerCommand(defaults: MockServerCommandDefaults = {}): Command {
  // sentinel default for --preset, so the first explicit flag replaces it instead of appending to it
  const defaultPresets: string[] = defaults.preset ?? ['fusion'];

  return createCommand('mock-server')
    .description(
      'Serve OpenAPI-fake responses over HTTP, from bundled presets and/or directories of specs',
    )
    .argument('[dirs...]', 'directories of OpenAPI specs to serve, in ascending precedence')
    .addOption(
      createOption(
        '--preset <name>',
        `bundled preset to layer in, in ascending precedence (repeatable; defaults to ${JSON.stringify(defaultPresets)}, replaced by the first explicit flag)`,
      )
        .default(defaultPresets)
        .argParser((value: string, previous: string[]) =>
          previous === defaultPresets ? [value] : [...previous, value],
        ),
    )
    .addOption(
      createOption(
        '--port <port>',
        `port to listen on (default: ${defaults.port ?? 'OS-assigned'})`,
      )
        .default(defaults.port)
        .argParser(Number),
    )
    .addOption(
      createOption('--host <host>', 'hostname to bind to').default(defaults.host ?? 'localhost'),
    )
    .addOption(
      createOption(
        '--seed <seed>',
        `seeds every service's faked responses, for reproducible output (default: ${defaults.seed ?? 'unseeded/random'})`,
      )
        .default(defaults.seed)
        .argParser(Number),
    )
    .action(async (dirs: string[], options: MockServerCommandOptions) => {
      const server = createMockServer({ seed: options.seed });
      // presets always apply before directories, regardless of flag position on the command line
      for (const preset of options.preset) server.use(preset);
      // directories are the highest-precedence layer, applied after every preset
      for (const dir of dirs) server.use(dir);

      const { url } = await server.start({ port: options.port, host: options.host });
      console.log(`mock server listening at ${url}`);

      const shutdown = (): void => {
        void server.close().finally(() => process.exit(0));
      };
      process.on('SIGINT', shutdown);
      process.on('SIGTERM', shutdown);
    });
}

export default createMockServerCommand;
