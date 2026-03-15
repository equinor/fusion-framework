import type { AnyModule } from './types.js';

/**
 * Console-based logging interface for Fusion Framework modules.
 *
 * Provides four log severity methods (`debug`, `info`, `warn`, `error`) and a numeric
 * `level` property that controls which messages are emitted. Set `level` to `0` to
 * suppress all output, or to `4` to include debug messages.
 *
 * @remarks
 * Severity thresholds follow ascending order: 0 = silent, 1 = errors only,
 * 2 = warnings and above, 3 = info and above, 4 = debug and above.
 */
export interface IConsoleLogger {
  /**
   * Active severity threshold controlling which messages are emitted.
   *
   * - `0` – silent (no output)
   * - `1` – errors only
   * - `2` – warnings and above
   * - `3` – info and above
   * - `4` – debug and above
   */
  level: 0 | 1 | 2 | 3 | 4;
  /** Logs a debug-level message (visible when level ≥ 4). */
  debug(...msg: unknown[]): void;
  /** Logs an informational message (visible when level ≥ 3). */
  info(...msg: unknown[]): void;
  /** Logs a warning message (visible when level ≥ 2). */
  warn(...msg: unknown[]): void;
  /** Logs an error message (visible when level ≥ 1). */
  error(...msg: unknown[]): void;
}
/**
 * Default console logger used internally by the Fusion Framework module system.
 *
 * Messages are prefixed with a styled `FUSION FRAMEWORK` banner and the logger’s
 * domain name so they can be visually distinguished in the browser console.
 *
 * The active severity threshold is controlled by the {@link IConsoleLogger.level | level}
 * property and defaults to the `FUSION_LOG_LEVEL` environment variable (fallback: `1`).
 *
 * @remarks
 * This is a lightweight, temporary implementation. A structured logger with
 * pluggable transports is planned as a future replacement.
 */
export class ConsoleLogger implements IConsoleLogger {
  /**
   * Active severity threshold.
   *
   * - `0` – silent (no output)
   * - `1` – errors only (default)
   * - `2` – warnings and above
   * - `3` – info and above
   * - `4` – debug and above
   */
  public level: 0 | 1 | 2 | 3 | 4 =
    (Number(process.env.FUSION_LOG_LEVEL) as 0 | 1 | 2 | 3 | 4) || 1;
  /**
   * Creates a new `ConsoleLogger` scoped to the given domain.
   *
   * @param domain - Human-readable label shown in the console banner (e.g. a module name).
   */
  constructor(protected domain: string) {}

  /**
   * Wraps raw log arguments in a styled console message with domain banner.
   *
   * @param msg - Arbitrary values to include in the log output.
   * @returns An array suitable for spreading into `console.*` methods.
   */
  protected _createMessage(msg: unknown[]): unknown[] {
    return [
      `%c FUSION FRAMEWORK %c ${this.domain} %c %s`,
      'background: rgb(179, 13, 47); color: white; padding: 1px;',
      'background: rgb(244, 244, 244); color: rgb(36, 55, 70); padding: 1px;',
      'background: none; color: inherit',
      ...msg.reduce((c: unknown[], n: unknown) => c.concat(n, '\n'), []),
    ];
  }

  /** Logs a debug-level message when {@link level} is 4 or higher. */
  debug(...msg: unknown[]) {
    this.level > 3 && console.debug(...this._createMessage(msg));
  }
  /** Logs an info-level message when {@link level} is 3 or higher. */
  info(...msg: unknown[]) {
    this.level > 2 && console.info(...this._createMessage(msg));
  }
  /** Logs a warning-level message when {@link level} is 2 or higher. */
  warn(...msg: unknown[]) {
    this.level > 1 && console.warn(...this._createMessage(msg));
  }
  /** Logs an error-level message when {@link level} is 1 or higher. */
  error(...msg: unknown[]) {
    this.level > 0 && console.error(...this._createMessage(msg));
  }
}

/**
 * Extends the {@link IConsoleLogger} interface to provide additional logging functionality
 * specific to modules. This interface includes a method for formatting module names
 * for consistent logging output.
 *
 * @remarks
 * Implementations should ensure that the `formatModuleName` method returns a string
 * representation of the module name, which can be used in log messages to identify
 * the source module.
 *
 * @see IConsoleLogger
 */
export interface IModuleConsoleLogger extends IConsoleLogger {
  /**
   * Formats the module name for logging purposes.
   *
   * @param moduleOrName - The module or its name to format.
   * @returns A formatted string representing the module name, suitable for console output.
   */
  formatModuleName(moduleOrName: string | AnyModule): string;
}

/**
 * A specialized logger that extends {@link ConsoleLogger} to provide enhanced formatting for module names.
 *
 * The `ModuleConsoleLogger` class implements the {@link IModuleConsoleLogger} interface and provides a method
 * to format module names with a distinctive style for console output, making them more readable and visually
 * distinct. The formatted name includes a package emoji and applies color and uppercase transformations.
 *
 * @example
 * ```typescript
 * const logger = new ModuleConsoleLogger();
 * logger.formatModuleName('MyModule'); // 📦 MY MODULE (styled in green)
 * ```
 */
export class ModuleConsoleLogger extends ConsoleLogger implements IModuleConsoleLogger {
  public formatModuleName(moduleOrName: string | AnyModule): string {
    const name = typeof moduleOrName === 'string' ? moduleOrName : moduleOrName.name;
    return `📦\u001b[1;32m${name.replace(/([A-Z])/g, ' $1').toUpperCase()}\x1b[0m`;
  }
}
