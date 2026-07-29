/**
 * Console-based logging interface for Fusion Framework modules.
 *
 * Provides four log severity methods (`debug`, `info`, `warn`, `error`) and a numeric
 * `level` property that controls which messages are emitted. Set `level` to `0` to
 * suppress all output, or to `4` to include debug messages.
 *
 * @remarks
 * Severity thresholds follow ascending order: 0 = silent, 1 = errors only,
 * 2 = warnings and above, 3 = info and above, 4 = debug and above.
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
  /**
   * Logs a debug-level message (visible when level ≥ 4).
   *
   * @param msg - Arbitrary values to include in the log output.
   */
  debug(...msg: unknown[]): void;
  /**
   * Logs an informational message (visible when level ≥ 3).
   *
   * @param msg - Arbitrary values to include in the log output.
   */
  info(...msg: unknown[]): void;
  /**
   * Logs a warning message (visible when level ≥ 2).
   *
   * @param msg - Arbitrary values to include in the log output.
   */
  warn(...msg: unknown[]): void;
  /**
   * Logs an error message (visible when level ≥ 1).
   *
   * @param msg - Arbitrary values to include in the log output.
   */
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
    // flatten the log args, inserting a newline between each for console readability
    const flatMsg = msg.reduce((c: unknown[], n: unknown) => c.concat(n, '\n'), []);
    return [
      `%c FUSION FRAMEWORK %c ${this.domain} %c %s`,
      'background: rgb(179, 13, 47); color: white; padding: 1px;',
      'background: rgb(244, 244, 244); color: rgb(36, 55, 70); padding: 1px;',
      'background: none; color: inherit',
      ...flatMsg,
    ];
  }

  /**
   * Logs a debug-level message when {@link level} is 4 or higher.
   *
   * @param msg - Arbitrary values to include in the log output.
   */
  debug(...msg: unknown[]) {
    this.level > 3 && console.debug(...this._createMessage(msg));
  }
  /**
   * Logs an info-level message when {@link level} is 3 or higher.
   *
   * @param msg - Arbitrary values to include in the log output.
   */
  info(...msg: unknown[]) {
    this.level > 2 && console.info(...this._createMessage(msg));
  }
  /**
   * Logs a warning-level message when {@link level} is 2 or higher.
   *
   * @param msg - Arbitrary values to include in the log output.
   */
  warn(...msg: unknown[]) {
    this.level > 1 && console.warn(...this._createMessage(msg));
  }
  /**
   * Logs an error-level message when {@link level} is 1 or higher.
   *
   * @param msg - Arbitrary values to include in the log output.
   */
  error(...msg: unknown[]) {
    this.level > 0 && console.error(...this._createMessage(msg));
  }
}

export default ConsoleLogger;
