import type { LogLevel } from './static.js';

/**
 * Contract for a structured logger that emits messages at different severity levels.
 *
 * Implement `ILogger` when you need a custom log destination (remote service,
 * in-memory buffer, test spy, etc.) while keeping the same call-site API that
 * the rest of Fusion Framework expects. The built-in {@link ConsoleLogger}
 * already satisfies this interface for browser / Node console output.
 *
 * @example
 * ```typescript
 * import { type ILogger, LogLevel } from '@equinor/fusion-log';
 *
 * class NoopLogger implements ILogger {
 *   level = LogLevel.None;
 *   debug() {}
 *   info() {}
 *   warn() {}
 *   error() {}
 *   createSubLogger(): ILogger { return this; }
 * }
 * ```
 */
export interface ILogger {
  /**
   * Active log level threshold.
   *
   * Messages with a severity **at or below** this level are emitted;
   * messages above it are silently discarded.
   *
   * @see {@link LogLevel}
   */
  level: LogLevel;

  /**
   * Emit a **debug**-level message.
   *
   * Use for verbose, development-only diagnostics such as variable dumps
   * or control-flow traces that should never appear in production.
   *
   * @param msg - One or more values to log (strings, objects, errors, etc.).
   */
  debug(...msg: unknown[]): void;

  /**
   * Emit an **info**-level message.
   *
   * Use for routine operational confirmations, such as successful
   * initialization or completed requests.
   *
   * @param msg - One or more values to log.
   */
  info(...msg: unknown[]): void;

  /**
   * Emit a **warning**-level message.
   *
   * Use when something unexpected occurred that does not prevent the
   * current operation but may indicate an issue to investigate.
   *
   * @param msg - One or more values to log.
   */
  warn(...msg: unknown[]): void;

  /**
   * Emit an **error**-level message.
   *
   * Use when an operation failed and the caller should be aware.
   * Prefer throwing an exception for unrecoverable failures.
   *
   * @param msg - One or more values to log.
   */
  error(...msg: unknown[]): void;

  /**
   * Create a child logger scoped to a narrower context.
   *
   * Sub-loggers typically prefix their output with the parent's title,
   * making it easy to trace log lines back to a specific component.
   *
   * @param args - Implementation-specific arguments (e.g., title, subtitle, log level).
   * @returns A new {@link ILogger} instance representing the sub-logger.
   */
  createSubLogger(...args: unknown[]): ILogger;
}
