import { dirname, relative } from 'node:path';

import { createCommand, createOption, type Command } from 'commander';

import { createMockServer } from '@equinor/fusion-openapi-mock-server';
import { discoverServices } from '@equinor/fusion-openapi-mock-server/discovery';
import {
  defineAnalyticsMock,
  defineAppFeatureEventsMock,
  defineHelpArticlesMock,
} from '@equinor/fusion-openapi-mock-server/presets/fusion';

import type { MockServerAnalyticsOptions } from './dev-server-options.js';
import { loadMockServerConfig } from './load-mock-server-config.js';
import { ensureGitIgnoredDir, resolveAnalytics } from './analytics/index.js';
import { resolveHelpDocs } from './resolve-help-docs.js';

/** Option values for `ffc mock-server`. */
interface MockServerCommandOptions {
  /** Bundled preset names to layer in, lowest precedence first (e.g. `['fusion']`). */
  preset: string[];
  /** Port to listen on; `undefined` lets the OS assign a free one. */
  port?: number;
  /** Hostname to bind to. */
  host?: string;
  /** Seeds every service's faked responses, if given. */
  seed?: number;
  /** Additional non-loopback browser origins allowed to call credentialed mock-auth endpoints. */
  allowOrigin: string[];
  /** `--help-docs <dir>` sets the help docs folder; `--no-help-docs` turns help docs off. */
  helpDocs?: string | false;
  /** `false` when `--no-analytics` is passed. */
  analytics: boolean;
  /** `--analytics-record <file>` sets the recording; `--no-analytics-record` keeps analytics in memory. */
  analyticsRecord?: string | false;
  /** Recordings loaded at start, from repeated `--analytics-seed <path>`. */
  analyticsSeed: string[];
}

/** Overrides for `ffc mock-server`'s own built-in defaults, set by whoever registers the plugin. */
export interface MockServerCommandDefaults {
  /** Mock-module directory used when no positional directory or config path is supplied. */
  path?: string;
  /** Bundled preset(s) to apply when `--preset` isn't given at all. Defaults to `['fusion']`. */
  preset?: string[];
  /** Port to listen on when `--port` isn't given. Defaults to `4010`. */
  port?: number;
  /** Hostname to bind to when `--host` isn't given. Defaults to `'localhost'`. */
  host?: string;
  /** Seed to apply when `--seed` isn't given. Defaults to unseeded (random) faked responses. */
  seed?: number;
  /** Additional non-loopback browser origins allowed to call credentialed mock-auth endpoints. */
  allowedOrigins?: string[];
  /** Help docs folder to serve when neither `--help-docs` nor `mockServer.helpDocs` is set; `false` disables auto-detection. */
  helpDocs?: string | false;
  /** Analytics settings used when neither flags nor `mockServer.analytics` set them; `false` turns analytics off. */
  analytics?: MockServerAnalyticsOptions | false;
}

/**
 * Builds the `ffc mock-server` command definition.
 *
 * Serves every service discovered from one or more directories of `<name>.mock.ts`
 * modules (plus any bundled presets) over HTTP, using
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
 * Serves local help articles and FAQs as a `help` service when a help docs
 * folder is set (`--help-docs`, `mockServer.helpDocs`) or auto-detected
 * (`./docs`, or `docs/<appKey>` in a parent folder), layered after presets and
 * before directories. A local `help.mock.ts` with `serviceDiscovery: 'merge'`
 * extends the help docs; a complete local definition replaces them, and when it
 * is the first local `help` module the docs layer is not added at all.
 * `--no-help-docs` opts out.
 *
 * Receives the analytics the app sends as a mock `monitor` service and answers
 * the Apps service's `POST /apps/feature-events/query` from them, appending
 * every batch to `.fusion-mock/analytics.jsonl` (`--analytics-record`) and
 * loading earlier recordings with `--analytics-seed`. Layered after help docs
 * and before directories, so a project's own `monitor.mock.ts` still wins.
 * `--no-analytics` opts out.
 *
 * Keeps the server running in the foreground until `SIGINT`/`SIGTERM`, so it
 * dies with whatever started it (e.g. Playwright's `webServer`) rather than
 * lingering as an orphaned process.
 *
 * @param defaults - Overrides for the command's own built-in path, preset, port, host, and seed defaults.
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
  const defaultAllowedOrigins: string[] = [];
  const defaultAnalyticsSeed: string[] = [];

  return createCommand('mock-server')
    .description('Serve OpenAPI-fake responses over HTTP, from bundled presets and/or mock modules')
    .argument('[dirs...]', 'directories of <name>.mock.ts modules, in ascending precedence')
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
        `port to listen on (default: config or ${defaults.port ?? 4010})`,
      ).argParser(Number),
    )
    .addOption(createOption('--host <host>', 'hostname to bind to (default: config or localhost)'))
    .addOption(
      createOption(
        '--seed <seed>',
        `seeds every service's faked responses, for reproducible output (default: ${defaults.seed ?? 'unseeded/random'})`,
      ).argParser(Number),
    )
    .addOption(
      createOption(
        '--allow-origin <origin>',
        'additional non-loopback browser origin allowed to call credentialed mock-auth endpoints (repeatable)',
      )
        .default(defaultAllowedOrigins)
        .argParser((value: string, previous: string[]) => [...previous, value]),
    )
    .addOption(
      createOption(
        '--help-docs <dir>',
        'help docs folder served as the local help service (default: config, or auto-detected ./docs or docs/<appKey>)',
      ),
    )
    .addOption(createOption('--no-help-docs', 'do not serve local help articles'))
    .addOption(
      createOption(
        '--no-analytics',
        'do not receive analytics or answer the app-feature events query',
      ),
    )
    .addOption(
      createOption(
        '--analytics-record <file>',
        'JSON Lines file received analytics are appended to (default: config or .fusion-mock/analytics.jsonl)',
      ),
    )
    .addOption(createOption('--no-analytics-record', 'keep received analytics in memory only'))
    .addOption(
      createOption(
        '--analytics-seed <path>',
        'analytics recording, landing-zone file, or folder loaded at start (repeatable; default: config)',
      )
        .default(defaultAnalyticsSeed)
        .argParser((value: string, previous: string[]) => [...previous, value]),
    )
    .action(async (dirs: string[], options: MockServerCommandOptions) => {
      const root = process.cwd();
      const config = await loadMockServerConfig(root);
      const sourceDirs = dirs.length ? dirs : [config.path ?? defaults.path ?? 'mocks'];
      const helpDocs = await resolveHelpDocs(root, {
        option: options.helpDocs,
        config: config.helpDocs,
        defaults: defaults.helpDocs,
      });
      const analytics = resolveAnalytics(root, {
        enabled: options.analytics,
        record: options.analyticsRecord,
        seed: options.analyticsSeed,
        config: config.analytics,
        defaults: defaults.analytics,
      });
      const definitionGroups = await Promise.all(
        sourceDirs
          // Resolve every configured layer before startup so discovery requirements are known.
          .map((dir) => discoverServices(dir)),
      );
      // Discovery modes of local `help` modules, in the same precedence order the server merges them.
      const localHelpModes = definitionGroups
        .flat()
        // Only modules for the help service affect how the docs layer participates.
        .filter((definition) => definition.key === 'help')
        // Legacy definitions without a mode are complete replacements.
        .map((definition) => definition.serviceDiscovery ?? 'replace');
      // The docs layer is the baseline when no local module precedes it with a complete definition:
      // a leading merge needs it, while a leading `'new'` or replacement owns the key outright.
      const helpDocsLayer =
        localHelpModes.length === 0 || localHelpModes[0] === 'merge' ? helpDocs : undefined;
      // A complete local module after merges still replaces the docs in the final service.
      const servedHelpDocs = localHelpModes.every((mode) => mode === 'merge')
        ? helpDocsLayer
        : undefined;
      // Configured help docs that end up unserved would otherwise look broken, so say why.
      if (helpDocs && !servedHelpDocs && helpDocs.source !== 'detected') {
        console.warn(
          `not serving help docs from ${relative(root, helpDocs.dir) || '.'}: a local mock module defines the help service`,
        );
      }
      // A complete local monitor module replaces the analytics mock, so its store would never fill.
      const monitorReplaced = definitionGroups
        .flat()
        // Merge modules extend the analytics mock; any other monitor module replaces it.
        .some(
          (definition) => definition.key === 'monitor' && definition.serviceDiscovery !== 'merge',
        );
      const analyticsLayer = monitorReplaced ? undefined : analytics;
      // Configured analytics that end up unserved would otherwise look broken, so say why.
      if (analytics && !analyticsLayer) {
        console.warn('not receiving analytics: a local mock module defines the monitor service');
      }
      // The default recording folder is kept out of Git so recordings are not committed by accident.
      if (analyticsLayer?.record && analyticsLayer.defaultRecord) {
        await ensureGitIgnoredDir(dirname(analyticsLayer.record));
      }
      const monitor = analyticsLayer
        ? defineAnalyticsMock({ record: analyticsLayer.record, seed: analyticsLayer.seed })
        : undefined;
      // Seeds load before startup so a missing file fails fast and the count can be shown.
      await monitor?.store.ready();
      // The query merges onto the preset's apps service, which only the fusion preset provides.
      const servesQuery = !!monitor && options.preset.includes('fusion');

      const server = createMockServer({
        seed: options.seed ?? config.seed ?? defaults.seed,
        allowedOrigins:
          options.allowOrigin === defaultAllowedOrigins
            ? (config.allowedOrigins ?? defaults.allowedOrigins)
            : options.allowOrigin,
      });
      // presets always apply before directories, regardless of flag position on the command line
      for (const preset of options.preset) server.use(preset);
      // Help docs sit between presets and directories, so a project's own help.mock.ts still wins.
      if (helpDocsLayer) server.use([defineHelpArticlesMock({ dir: helpDocsLayer.dir })]);
      // Analytics sit after help docs and before directories, so a project's own mocks still win.
      if (monitor) {
        server.use(
          servesQuery ? [monitor, defineAppFeatureEventsMock({ store: monitor.store })] : [monitor],
        );
      }
      // Resolved directory groups are the highest-precedence layers, applied after every preset.
      for (const definitions of definitionGroups) server.use(definitions);

      const { url } = await server.start({
        port: options.port ?? config.port ?? defaults.port ?? 4010,
        host: options.host ?? config.host ?? defaults.host ?? 'localhost',
      });
      console.log(`mock server listening at ${url}`);
      // One line keeps the help docs source visible, since auto-detection can pick a parent folder.
      if (servedHelpDocs) {
        console.log(
          `serving ${servedHelpDocs.articleCount} help article(s) and ${servedHelpDocs.faqCount} FAQ(s) from ${relative(root, servedHelpDocs.dir) || '.'} (${servedHelpDocs.source})`,
        );
      }

      // One line shows where analytics go and what history was loaded, since recording is on by default.
      if (monitor) {
        const recording = monitor.store.recordFile
          ? `recording to ${relative(root, monitor.store.recordFile)}`
          : 'kept in memory';
        const seeded = monitor.store.getRecords().length;
        // Seed paths are shown relative to the project, like the other startup lines.
        const seedPaths = (analyticsLayer?.seed ?? []).map((path) => relative(root, path) || '.');
        const seedInfo = seedPaths.length
          ? `, ${seeded} seeded event(s) from ${seedPaths.join(', ')}`
          : '';
        const query = servesQuery
          ? ''
          : ' (no app-feature events query: the fusion preset is not loaded)';
        console.log(`receiving analytics, ${recording}${seedInfo}${query}`);
      }

      const shutdown = (): void => {
        void server.close().finally(() => process.exit(0));
      };
      process.on('SIGINT', shutdown);
      process.on('SIGTERM', shutdown);
    });
}

export default createMockServerCommand;
