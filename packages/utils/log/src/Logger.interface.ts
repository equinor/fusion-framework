import { LogLevel } from './static';

/**
 * Defines the interface for a logger that can be used to log messages at different severity levels.
 */
export interface ILogger {
  /**
   * Logging level indicating the severity of messages to log.
   * @see {@link LogLevel}
   */
  level: LogLevel;

  /**
   * Logs a debug message. Debug messages are detailed information, considered useful only during development and debugging.
   * @param msg The messages or objects to log.
   */
  debug(...msg: unknown[]): void; // Log debug messages

  /**
   * Logs an informational message. Info messages convey general information about the application's execution.
   * @param msg The messages or objects to log.
   */
  info(...msg: unknown[]): void; // Log informational messages

  /**
   * Logs a warning message. Warning messages indicate potential issues or important, but not critical, information.
   * @param msg The messages or objects to log.
   */
  warn(...msg: unknown[]): void; // Log warning messages

  /**
   * Logs an error message. Error messages indicate a failure from which the application may not be able to recover.
   * @param msg The messages or objects to log.
   */
  error(...msg: unknown[]): void; // Log error messages

  /**
   * Creates a new sub-logger with a specific title.
   *
   * @param args - Additional arguments to pass to the sub-logger creation.
   * @returns A new `ILogger` instance representing the sub-logger.
   */
  createSubLogger(...args: unknown[]): ILogger; // Create a sub-logger with a specific title
}
