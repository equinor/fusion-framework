import { Logger, LogLevel } from '@azure/msal-browser';

/**
 * Logger functions of {@link Console}
 */
type ConsoleLevel = 'error' | 'warn' | 'info' | 'debug';

/**
 * MSAL client logger for development, production should use telemetry
 *
 * @example
 * ```typescript
 * client.setLogger(new ConsoleLogger());
 * ```
 */
export class ConsoleLogger extends Logger {
    /**
     * @param logLevel - 0-1-2-3 (error-warning-info-debug) if not provided all records logged
     */
    constructor(logLevel?: LogLevel) {
        super({
            logLevel,
            loggerCallback: (...args: [LogLevel, string, boolean]) => this.loggerCallback(...args),
        });
    }

    /** @inheritdoc */
    protected loggerCallback(lvl: LogLevel, msg: string, _containsPii?: boolean): void {
        console[this.getLogType(lvl)](
            `%c FUSION::MSAL %c %s`,
            'border: 1px solid;',
            'border: none;',
            msg
        );
    }

    /**
     * Map log level to console log function type
     */
    protected getLogType = (lvl: LogLevel): ConsoleLevel => {
        switch (lvl) {
            case LogLevel.Error:
                return 'error';
            case LogLevel.Warning:
                return 'warn';
            case LogLevel.Info:
                return 'info';
            case LogLevel.Verbose:
            default:
                return 'debug';
        }
    };
}

export default ConsoleLogger;
