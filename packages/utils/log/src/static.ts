import { resolveLogLevel } from './resolve-log-level.js';

/**
 * Severity levels that control which log messages are emitted.
 *
 * Higher numeric values represent more verbose output. Set a logger's
 * {@link ILogger.level | level} property to one of these values to filter
 * messages at runtime.
 *
 * | Member      | Value | Meaning                                                          |
 * |-------------|-------|------------------------------------------------------------------|
 * | `None`      | 0     | Logging disabled — no messages are emitted.                      |
 * | `Error`     | 1     | A serious failure that prevented an operation from completing.   |
 * | `Warning`   | 2     | Something unexpected that may need investigation.                |
 * | `Info`      | 3     | Routine operational confirmation (e.g., "module initialised").   |
 * | `Debug`     | 4     | Verbose diagnostic detail for development only.                  |
 *
 * @example
 * ```typescript
 * import { ConsoleLogger, LogLevel } from '@equinor/fusion-log';
 * const logger = new ConsoleLogger('App');
 * logger.level = LogLevel.Warning; // suppress Info and Debug
 * ```
 */
export enum LogLevel {
  /** Logging disabled — no messages are emitted. */
  None = 0,
  /** A serious failure that prevented an operation from completing. */
  Error = 1,
  /** Something unexpected that may need investigation. */
  Warning = 2,
  /** Routine operational confirmation. */
  Info = 3,
  /** Verbose diagnostic detail for development only. */
  Debug = 4,
}

/**
 * Resolve the default log level from the `FUSION_LOG_LEVEL` environment variable.
 *
 * Resolution order:
 * 1. If `FUSION_LOG_LEVEL` is set and parsable, use the parsed value.
 * 2. If parsing fails and `NODE_ENV === 'development'`, fall back to {@link LogLevel.Debug}.
 * 3. Otherwise fall back to {@link LogLevel.Error}.
 * 4. If the variable is not set at all, default to {@link LogLevel.Error}.
 *
 * @returns The resolved {@link LogLevel}.
 */
const resolveDefaultLogLevel = (): LogLevel => {
  const envLogLevel = process.env.FUSION_LOG_LEVEL;

  if (envLogLevel) {
    try {
      return resolveLogLevel(envLogLevel);
    } catch {
      // Unparsable value — degrade gracefully based on environment
      return process.env.NODE_ENV === 'development' ? LogLevel.Debug : LogLevel.Error;
    }
  }

  return LogLevel.Error;
};

/**
 * The default {@link LogLevel} resolved once at module load from the
 * `FUSION_LOG_LEVEL` environment variable.
 *
 * Use this value when initialising a logger and no explicit level has
 * been provided by the caller.
 *
 * @see {@link resolveDefaultLogLevel} for resolution rules.
 */
export const defaultLogLevel = resolveDefaultLogLevel();
