import chalk from 'chalk';

export interface ILogger {
    /**
     * Logging level indicating the severity of messages to log.
     * - 0: No logging
     * - 1: Error
     * - 2: Warning
     * - 3: Info
     * - 4: Debug
     */
    level: 0 | 1 | 2 | 3 | 4;

    /**
     * Logs a debug message. Debug messages are detailed information, considered useful only during development and debugging.
     * @param msg The messages or objects to log.
     */
    debug(...msg: unknown[]): void;

    /**
     * Logs an informational message. Info messages convey general information about the application's execution.
     * @param msg The messages or objects to log.
     */
    info(...msg: unknown[]): void;

    /**
     * Logs a warning message. Warning messages indicate potential issues or important, but not critical, information.
     * @param msg The messages or objects to log.
     */
    warn(...msg: unknown[]): void;

    /**
     * Logs an error message. Error messages indicate a failure from which the application may not be able to recover.
     * @param msg The messages or objects to log.
     */
    error(...msg: unknown[]): void;

    /**
     * Creates a sub-logger with a new domain. This is useful for creating a logger for a specific part of your application with its own title.
     * @param domain The domain or title for the sub-logger.
     * @returns A new instance of ILogger with the specified domain.
     */
    createSubLogger(domain: string): ILogger;
}

export class ConsoleLogger implements ILogger {
    /** - 0-1-2-3 (error-warning-info-debug) if not provided only errors are logged */
    public level: 0 | 1 | 2 | 3 | 4;

    /**
     * Constructs a new ConsoleLogger instance.
     * @param title The main title of the logger, used to identify the source of the log messages.
     * @param subtitle An optional subtitle for additional context, such as a specific component or functionality within the source.
     */
    constructor(
        protected title: string,
        protected subtitle?: string,
    ) {
        if (process?.env?.FUSION_LOG_LEVEL) {
            this.level = parseInt(process.env.FUSION_LOG_LEVEL) as 0 | 1 | 2 | 3 | 4;
        } else {
            this.level = process.env.NODE_ENV === 'development' ? 3 : 1;
        }
    }

    /**
     * Generates the formatted message to log, including the title, subtitle (if any), and the messages provided.
     * @param msg The messages or objects to include in the log.
     * @returns An array of unknown, representing the formatted log message.
     */
    protected _createMessage(...msg: unknown[]): unknown[] {
        return [
            chalk.bgRed.whiteBright(
                ` ${this.title} `,
                this.subtitle ? chalk.bgBlack(` ${this.subtitle} `) : '',
            ),
            ...msg.reduce((c: unknown[], n: unknown) => [...c, n], []),
        ];
    }

    /**
     * Creates a sub-logger with a new title and optionally a new subtitle.
     * Inherits the logging level from the parent logger.
     * @param title The title for the new sub-logger.
     * @param subtitle An optional subtitle for the new sub-logger. If not provided, the parent's subtitle is used.
     * @returns A new ConsoleLogger instance as an ILogger.
     */
    public createSubLogger(title: string, subtitle?: string): ILogger {
        const logger = new ConsoleLogger(`${this.title}:${title}`, subtitle ?? this.subtitle);
        logger.level = this.level;
        return logger;
    }

    /**
     * Logs a debug message if the current logging level includes debug messages.
     * @param msg The messages or objects to log.
     */
    debug(...msg: unknown[]) {
        this.level > 3 && console.debug(...this._createMessage(...msg));
    }

    /**
     * Logs an info message if the current logging level includes info messages.
     * @param msg The messages or objects to log.
     */
    info(...msg: unknown[]) {
        this.level > 2 && console.info(...this._createMessage(...msg));
    }

    /**
     * Logs a warning message if the current logging level includes warning messages.
     * @param msg The messages or objects to log.
     */
    warn(...msg: unknown[]) {
        this.level > 1 && console.warn(...this._createMessage(...msg));
    }

    /**
     * Logs an error message if the current logging level includes error messages.
     * @param msg The messages or objects to log.
     */
    error(...msg: unknown[]) {
        this.level > 0 && console.error(...this._createMessage(...msg));
    }
}
