import chalk from 'chalk';
import { ILogger } from './Logger.interface';
import Logger from './Logger';
import { LogLevel } from './static';

/**
 * Provides a console-based logger implementation that supports different log levels.
 *
 * The `ConsoleLogger` class implements the `ILogger` interface and allows for logging messages
 * to the console with different log levels (debug, info, warn, error). The logger can be
 * configured with a title and an optional subtitle to provide context for the log messages.
 *
 * The logger also supports creating sub-loggers with a new title and optional subtitle, which
 * inherit the logging level from the parent logger.
 *
 * Example usage:
 * ```typescript
 * const logger = new ConsoleLogger('MainLogger');
 * logger.info('This is an info message');
 * logger.warn('This is a warning message');
 * logger.error('This is an error message');
 *
 * // supports multiple messages
 * logger.debug('This is a debug message', 'This is an additional message');
 *
 * const subLogger = logger.createSubLogger('SubLogger');
 * subLogger.debug('This is a debug message from the sub-logger');
 * ```
 */
export class ConsoleLogger extends Logger {
    /**
     * Constructs a new ConsoleLogger instance.
     * @param title The main title of the logger, used to identify the source of the log messages.
     * @param subtitle An optional subtitle for additional context, such as a specific component or functionality within the source.
     */
    constructor(
        protected readonly title: string,
        protected readonly subtitle?: string,
    ) {
        super();
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
     * Generates the formatted message to log, including the title, subtitle (if any), and the messages provided.
     * @param msg The messages or objects to include in the log.
     * @returns An array of unknown, representing the formatted log message.
     */
    protected _createMessage(lvl: LogLevel, ...msg: unknown[]): unknown[] {
        return this._formatMessage(lvl, this._formatTitle(lvl), ...msg);
    }

    protected _formatTitle(_lvl: LogLevel): string {
        const title = [this.title, this.subtitle].filter((x) => !!x).join(' - ');
        return chalk.magenta(title);
    }

    protected _formatMessage(lvl: LogLevel, ...msg: unknown[]): unknown[] {
        switch (lvl) {
            case LogLevel.Debug:
                return [chalk.dim(...msg)];
            case LogLevel.Warning:
                return [chalk.bold(...msg)];
            default:
                return msg;
        }
    }

    /**
     * Creates a sub-logger with a new title and optionally a new subtitle.
     * Inherits the logging level from the parent logger.
     * @param title The title for the new sub-logger.
     * @param subtitle An optional subtitle for the new sub-logger. If not provided, the parent's subtitle is used.
     * @returns A new ConsoleLogger instance as an ILogger.
     */
    public createSubLogger(title: string, subtitle?: string): ILogger {
        const logger = new ConsoleLogger(`${this.title}::${title}`, subtitle ?? this.subtitle);
        logger.level = this.level;
        return logger;
    }
}
