import chalk from 'chalk';
import type { ILogger } from './Logger.interface.js';
import Logger from './Logger.js';
import { LogLevel } from './static.js';

/**
 * Console-based logger that writes colour-coded, titled messages via the
 * native `console` API.
 *
 * `ConsoleLogger` is the default {@link ILogger} implementation shipped with
 * `@equinor/fusion-log`. Use it whenever you need structured console output
 * with a title prefix, optional subtitle, and severity-based formatting.
 *
 * Each instance subscribes to the filtered {@link Logger.log} observable at
 * construction time, routing entries to `console.debug`, `console.info`,
 * `console.warn`, or `console.error` according to severity.
 *
 * Create hierarchical loggers with {@link ConsoleLogger.createSubLogger} to
 * trace output back to specific components.
 *
 * @example
 * ```typescript
 * import { ConsoleLogger, LogLevel } from '@equinor/fusion-log';
 *
 * const logger = new ConsoleLogger('App');
 * logger.level = LogLevel.Debug;
 * logger.info('Application started');
 *
 * const sub = logger.createSubLogger('Router');
 * sub.debug('Navigated to /dashboard');
 * ```
 */
export class ConsoleLogger extends Logger {
  /**
   * Create a new `ConsoleLogger`.
   *
   * @param title - Primary label prepended to every log line (e.g. module or
   *   application name).
   * @param subtitle - Optional secondary label for narrower context (e.g.
   *   component or feature name).
   */
  constructor(
    protected readonly title: string,
    protected readonly subtitle?: string,
  ) {
    super();
    // Route filtered log entries to the matching console method
    this.log.subscribe(({ lvl, msg }) => {
      switch (lvl) {
        case LogLevel.Debug:
          console.debug(...msg);
          break;
        case LogLevel.Info:
          console.info(...msg);
          break;
        case LogLevel.Warning:
          console.warn(...msg);
          break;
        case LogLevel.Error:
          console.error(...msg);
          break;
      }
    });
  }

  /**
   * Format raw log arguments by prepending a coloured title/subtitle prefix.
   *
   * @param lvl - Severity used to apply bold formatting for warnings/errors.
   * @param msg - Caller-supplied values.
   * @returns Formatted message array ready for `console.*`.
   */
  protected _createMessage(lvl: LogLevel, ...msg: unknown[]): unknown[] {
    return [this._formatTitle(lvl), ...msg];
  }

  /**
   * Build the chalk-coloured title prefix for a log entry.
   *
   * Warnings and errors are rendered in **bold** magenta; other levels use
   * regular-weight magenta.
   *
   * @param _lvl - Severity level of the log entry.
   * @returns A chalk-formatted title string.
   */
  protected _formatTitle(_lvl: LogLevel): string {
    const title = chalk.magenta([this.title, this.subtitle].filter((x) => !!x).join(' - '));
    switch (_lvl) {
      case LogLevel.Warning:
      case LogLevel.Error:
        return chalk.bold(title);
    }
    return title;
  }

  /**
   * Create a child `ConsoleLogger` whose title is prefixed with the parent's title.
   *
   * The sub-logger inherits the parent's log level unless an explicit
   * `logLevel` is provided.
   *
   * @param title - Label for the child logger (appended as `ParentTitle::title`).
   * @param subtitle - Optional subtitle; falls back to the parent's subtitle.
   * @param logLevel - Explicit log level override. When omitted the parent's
   *   current level is inherited.
   * @returns A new {@link ConsoleLogger} cast to {@link ILogger}.
   */
  public createSubLogger(title: string, subtitle?: string, logLevel?: LogLevel): ILogger {
    const logger = new ConsoleLogger(`${this.title}::${title}`, subtitle ?? this.subtitle);
    logger.level = logLevel === undefined ? this.level : logLevel;
    return logger;
  }
}
