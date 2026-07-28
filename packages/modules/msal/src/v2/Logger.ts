import { LogLevel, type ILoggerCallback, type LoggerOptions } from './types.js';

/**
 * Class which facilitates logging of messages to a specific place
 */
export class Logger {
  // Correlation ID for request, usually set by user.
  private correlationId: string;

  // Current log level, defaults to info.
  private level: LogLevel = LogLevel.Info;

  // Boolean describing whether PII logging is allowed.
  private piiLoggingEnabled: boolean;

  // Callback to send messages to.
  private localCallback: ILoggerCallback;

  // Package name implementing this logger
  private packageName: string;

  // Package version implementing this logger
  private packageVersion: string;

  /**
   * Creates a new `Logger`.
   *
   * @param loggerOptions - Logger configuration, including callback, PII, and log level settings.
   * @param packageName - Name of the package implementing this logger.
   * @param packageVersion - Version of the package implementing this logger.
   */
  constructor(loggerOptions: LoggerOptions, packageName?: string, packageVersion?: string) {
    const defaultLoggerCallback = () => {
      return;
    };
    const setLoggerOptions = loggerOptions || Logger.createDefaultLoggerOptions();
    this.localCallback = setLoggerOptions.loggerCallback || defaultLoggerCallback;
    this.piiLoggingEnabled = setLoggerOptions.piiLoggingEnabled || false;
    this.level =
      typeof setLoggerOptions.logLevel === 'number' ? setLoggerOptions.logLevel : LogLevel.Info;
    this.correlationId = setLoggerOptions.correlationId || '';
    this.packageName = packageName || '';
    this.packageVersion = packageVersion || '';
  }

  /**
   * Creates the default logger options used when none are provided.
   *
   * @returns Default logger options with a no-op callback, PII logging disabled, and Info level.
   */
  private static createDefaultLoggerOptions(): LoggerOptions {
    return {
      loggerCallback: () => {
        // allow users to not set loggerCallback
      },
      piiLoggingEnabled: false,
      logLevel: LogLevel.Info,
    };
  }

  /**
   * Create new Logger with existing configurations.
   *
   * @param packageName - Name of the package implementing this logger.
   * @param packageVersion - Version of the package implementing this logger.
   * @param correlationId - Correlation ID to use, falling back to this logger's own if omitted.
   * @returns A new `Logger` instance cloned from this one.
   */
  public clone(packageName: string, packageVersion: string, correlationId?: string): Logger {
    return new Logger(
      {
        loggerCallback: this.localCallback,
        piiLoggingEnabled: this.piiLoggingEnabled,
        logLevel: this.level,
        correlationId: correlationId || this.correlationId,
      },
      packageName,
      packageVersion,
    );
  }

  /**
   * Logs error messages.
   *
   * @param message - The message to log.
   * @param correlationId - Correlation ID to attach to the log entry, if any.
   */
  error(message: string, correlationId?: string): void {
    this.logMessage(message, {
      logLevel: LogLevel.Error,
      containsPii: false,
      correlationId: correlationId || '',
    });
  }

  /**
   * Logs warning messages.
   *
   * @param message - The message to log.
   * @param correlationId - Correlation ID to attach to the log entry, if any.
   */
  warning(message: string, correlationId?: string): void {
    this.logMessage(message, {
      logLevel: LogLevel.Warning,
      containsPii: false,
      correlationId: correlationId || '',
    });
  }

  /**
   * Logs info messages.
   *
   * @param message - The message to log.
   * @param correlationId - Correlation ID to attach to the log entry, if any.
   */
  info(message: string, correlationId?: string): void {
    this.logMessage(message, {
      logLevel: LogLevel.Info,
      containsPii: false,
      correlationId: correlationId || '',
    });
  }

  /**
   * Logs verbose messages.
   *
   * @param message - The message to log.
   * @param correlationId - Correlation ID to attach to the log entry, if any.
   */
  verbose(message: string, correlationId?: string): void {
    this.logMessage(message, {
      logLevel: LogLevel.Verbose,
      containsPii: false,
      correlationId: correlationId || '',
    });
  }

  /**
   * Logs trace messages.
   *
   * @param message - The message to log.
   * @param correlationId - Correlation ID to attach to the log entry, if any.
   */
  trace(message: string, correlationId?: string): void {
    this.logMessage(message, {
      logLevel: LogLevel.Trace,
      containsPii: false,
      correlationId: correlationId || '',
    });
  }

  /**
   * Returns whether PII Logging is enabled or not.
   *
   * @returns `true` when PII logging is enabled, otherwise `false`.
   */
  isPiiLoggingEnabled(): boolean {
    return this.piiLoggingEnabled || false;
  }

  /**
   * Formats and dispatches a log message to the configured callback, unless it
   * is below the configured log level or contains PII while PII logging is disabled.
   *
   * @param logMessage - The raw message to log.
   * @param options - Log level, PII flag, and correlation ID for this message.
   */
  private logMessage(
    logMessage: string,
    options: {
      logLevel: LogLevel;
      containsPii: boolean;
      correlationId: string;
    },
  ): void {
    // Skip messages below the configured level or containing PII when PII logging is disabled
    if (options.logLevel > this.level || (!this.piiLoggingEnabled && options.containsPii)) {
      return;
    }
    const timestamp = new Date().toUTCString();

    // Add correlationId to logs if set, correlationId provided on log messages take precedence
    const logHeader = `[${timestamp}] : [${options.correlationId || this.correlationId || ''}]`;

    const log = `${logHeader} : ${this.packageName}@${
      this.packageVersion
    } : ${LogLevel[options.logLevel]} - ${logMessage}`;
    this.executeCallback(options.logLevel, log, options.containsPii || false);
  }

  /**
   * Execute callback with message.
   *
   * @param level - The log level of the message.
   * @param message - The formatted message to send to the callback.
   * @param containsPii - Whether the message contains personally identifiable information.
   */
  executeCallback(level: LogLevel, message: string, containsPii: boolean): void {
    // Only invoke the callback when one has been configured
    if (this.localCallback) {
      this.localCallback(level, message, containsPii);
    }
  }
}
