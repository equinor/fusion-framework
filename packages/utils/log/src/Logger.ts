import { Subject, type Observable } from 'rxjs';
import { filter } from 'rxjs/operators';
import { LogLevel, defaultLogLevel } from './static.js';
import type { ILogger } from './Logger.interface.js';
import { version } from './version.js';

/**
 * Abstract base class for structured loggers in Fusion Framework.
 *
 * Extend `Logger` when you need a custom log destination while reusing the
 * built-in level filtering and RxJS observable pipeline. The class provides:
 *
 * - A configurable {@link LogLevel} threshold (`level`).
 * - An internal RxJS `Subject` (`_log$`) that all convenience methods write to.
 * - A public {@link Logger.log | log} observable that only emits entries whose
 *   severity meets the current threshold.
 * - Convenience methods (`debug`, `info`, `warn`, `error`) that delegate
 *   message formatting to the abstract {@link Logger._createMessage} hook.
 *
 * Concrete subclasses **must** implement:
 * - {@link Logger._createMessage} — format raw arguments into the array
 *   stored in the log entry.
 * - {@link Logger.createSubLogger} — produce a child logger scoped to a
 *   narrower context.
 *
 * @example
 * ```typescript
 * import { Logger, LogLevel } from '@equinor/fusion-log';
 *
 * class ArrayLogger extends Logger {
 *   readonly entries: Array<{ lvl: LogLevel; msg: unknown[] }> = [];
 *
 *   constructor() {
 *     super();
 *     this.log.subscribe((entry) => this.entries.push(entry));
 *   }
 *
 *   protected _createMessage(_lvl: LogLevel, ...msg: unknown[]): unknown[] {
 *     return msg;
 *   }
 *
 *   createSubLogger(): ILogger {
 *     return new ArrayLogger();
 *   }
 * }
 * ```
 */
export abstract class Logger implements ILogger {
  /** Active log-level threshold (defaults to {@link defaultLogLevel}). */
  public level: LogLevel = defaultLogLevel;

  /** Semantic version of the `@equinor/fusion-log` package. */
  public readonly version = version;

  /**
   * Internal subject that receives **every** log entry regardless of the
   * current level. Subscribe to `_log$` directly when you need an
   * unfiltered stream (e.g. for persisting all messages to a remote store).
   */
  protected readonly _log$ = new Subject<{ lvl: LogLevel; msg: unknown[] }>();

  /**
   * Observable stream of log entries filtered by the current {@link level}.
   *
   * Only entries whose severity is **at or below** the configured level are
   * emitted. Subscribe to this in concrete subclasses to drive output.
   *
   * @returns An RxJS `Observable` of `{ lvl, msg }` log records.
   */
  public get log(): Observable<{ lvl: LogLevel; msg: unknown[] }> {
    return this._log$.pipe(filter((x) => this.level >= x.lvl));
  }

  /**
   * Log a debug-level message.
   * @param msg - Values to log.
   */
  public debug(...msg: unknown[]): void {
    this._log$.next({ lvl: LogLevel.Debug, msg: this._createMessage(LogLevel.Debug, ...msg) });
  }

  /**
   * Log an info-level message.
   * @param msg - Values to log.
   */
  public info(...msg: unknown[]): void {
    this._log$.next({ lvl: LogLevel.Info, msg: this._createMessage(LogLevel.Info, ...msg) });
  }

  /**
   * Log a warning-level message.
   * @param msg - Values to log.
   */
  public warn(...msg: unknown[]): void {
    this._log$.next({
      lvl: LogLevel.Warning,
      msg: this._createMessage(LogLevel.Warning, ...msg),
    });
  }

  /**
   * Log an error-level message.
   * @param msg - Values to log.
   */
  public error(...msg: unknown[]): void {
    this._log$.next({ lvl: LogLevel.Error, msg: this._createMessage(LogLevel.Error, ...msg) });
  }

  /** {@inheritDoc ILogger.createSubLogger} */
  public abstract createSubLogger(...args: unknown[]): ILogger;

  /**
   * Format raw log arguments into the array that will be stored in the
   * log entry's `msg` field.
   *
   * @param lvl - The severity level of the entry being created.
   * @param msg - Caller-supplied values.
   * @returns Formatted message array.
   */
  protected abstract _createMessage(lvl: LogLevel, ...msg: unknown[]): unknown[];
}

export default Logger;
