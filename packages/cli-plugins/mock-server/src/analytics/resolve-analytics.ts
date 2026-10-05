import { resolve } from 'node:path';

import type { MockServerAnalyticsOptions } from '../dev-server-options.js';

/** Recording file used when no `record` setting is given, relative to the project root. */
const DEFAULT_ANALYTICS_RECORD = '.fusion-mock/analytics.jsonl';

/** Analytics settings `ffc mock-server` starts the analytics mocks with. */
export interface ResolvedAnalytics {
  /** Absolute recording file, or `undefined` to keep analytics in memory only. */
  record?: string;
  /** Whether {@link ResolvedAnalytics.record} is the built-in default, whose folder is kept out of Git. */
  defaultRecord: boolean;
  /** Absolute seed recordings, in load order. */
  seed: string[];
}

/** Analytics inputs for {@link resolveAnalytics}, in descending precedence. */
export interface ResolveAnalyticsOptions {
  /** `false` from `--no-analytics`. */
  enabled?: boolean;
  /** `--analytics-record <file>` (string) or `--no-analytics-record` (`false`). */
  record?: string | false;
  /** Repeated `--analytics-seed <path>` values. */
  seed?: string[];
  /** `mockServer.analytics` from `dev-server.config.ts`. */
  config?: MockServerAnalyticsOptions | false;
  /** `analytics` passed to `mockServerPlugin()` in `fusion-cli.config.ts`. */
  defaults?: MockServerAnalyticsOptions | false;
}

/**
 * Resolves whether `ffc mock-server` receives analytics, where it records them, and which
 * recordings it loads at start.
 *
 * @remarks
 * Command-line flags win over `mockServer.analytics` in `dev-server.config.ts`, which wins over
 * the plugin's defaults. Analytics are on unless `--no-analytics` is passed, or the config or
 * plugin default is `false` and no analytics flag is given. Recording defaults to
 * {@link DEFAULT_ANALYTICS_RECORD}; seed recordings default to none. Paths are resolved against the
 * project root.
 *
 * @param root - Project root.
 * @param options - Flags, config, and plugin defaults.
 * @returns The analytics settings, or `undefined` when analytics are turned off.
 *
 * @example
 * ```typescript
 * resolveAnalytics('/app', { seed: ['recordings'] });
 * // → { record: '/app/.fusion-mock/analytics.jsonl', defaultRecord: true, seed: ['/app/recordings'] }
 * ```
 */
export function resolveAnalytics(
  root: string,
  options: ResolveAnalyticsOptions,
): ResolvedAnalytics | undefined {
  const { enabled = true, record, seed = [], config, defaults } = options;
  const flagged = record !== undefined || seed.length > 0;
  // `--no-analytics` always wins; a disabled config or default only applies without analytics flags.
  if (
    !enabled ||
    (!flagged && (config === false || (config === undefined && defaults === false)))
  ) {
    return undefined;
  }

  const configured = config === false ? undefined : config;
  const fallback = defaults === false ? undefined : defaults;
  const recordSetting =
    record ?? configured?.record ?? fallback?.record ?? DEFAULT_ANALYTICS_RECORD;
  const seedSetting = seed.length > 0 ? seed : (configured?.seed ?? fallback?.seed ?? []);

  // A single seed path is accepted as well as a list; each is resolved against the project root.
  const seedPaths = (typeof seedSetting === 'string' ? [seedSetting] : seedSetting).map((path) =>
    resolve(root, path),
  );

  return {
    record: recordSetting === false ? undefined : resolve(root, recordSetting),
    defaultRecord: recordSetting === DEFAULT_ANALYTICS_RECORD,
    seed: seedPaths,
  };
}

export default resolveAnalytics;
