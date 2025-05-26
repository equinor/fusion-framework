// ConsoleLogger provides a unified interface for logging and spinner-based feedback in CLI tools.
// It wraps a Spinner instance and exposes methods for different log levels and progress reporting.
import { Spinner, type SpinnerOptions } from './Spinner.js';

/**
 * ConsoleLogger is a utility class for logging progress, status, and debug information in CLI applications.
 * It uses a spinner for visual feedback and supports debug mode for verbose output.
 *
 * @remarks
 * This class is designed for CLI tools that require both spinner-based progress indication and
 * structured logging at various levels (info, warn, error, debug).
 *
 * @example
 * ```ts
 * const logger = new ConsoleLogger('My CLI', { debug: true });
 * logger.start('Starting task...');
 * logger.succeed('Task complete!');
 * logger.debug('Debug info');
 * ```
 */
export class ConsoleLogger {
  /**
   * The spinner instance used for progress and status messages.
   */
  public readonly spinner: Spinner;
  /**
   * Indicates if debug mode is enabled for verbose output.
   */
  public readonly debugMode: boolean;

  /**
   * Creates a new ConsoleLogger.
   * @param title - Prefix for spinner/log messages.
   * @param options - Optional debug flag.
   */
  constructor(title: string, options?: { debug?: boolean }) {
    this.spinner = new Spinner({ prefixText: title });
    this.debugMode = options?.debug ?? false;
  }
  /**
   * Start the spinner with a message.
   * @param args - Message parts to display.
   */
  start(...args: string[]) {
    this.spinner.start(...args);
  }
  /**
   * Mark spinner as succeeded with a message.
   * @param args - Message parts to display.
   */
  succeed(...args: string[]) {
    this.spinner.succeed(...args);
  }
  /**
   * Mark spinner as failed with a message.
   * @param args - Message parts to display.
   */
  fail(...args: string[]) {
    this.spinner.fail(...args);
  }
  /**
   * Log an error message to the console.
   * @param args - Error message parts.
   */
  // biome-ignore lint/suspicious/noExplicitAny: same as original
  error(...args: any[]) {
    console.log(...args);
  }
  /**
   * Log a warning message.
   * @param args - Warning message parts.
   */
  warn(...args: string[]) {
    this.spinner.warn(...args);
  }
  /**
   * Log an informational message.
   * @param args - Info message parts.
   */
  info(...args: string[]) {
    this.spinner.info(...args);
  }
  /**
   * Alias for info.
   * @param args - Info message parts.
   */
  log(...args: string[]) {
    this.spinner.info(...args);
  }
  /**
   * Log debug messages if debugMode is enabled.
   * @param args - Debug message parts.
   */
  // biome-ignore lint/suspicious/noExplicitAny: same as original
  debug(...args: any[]) {
    if (this.debugMode) {
      console.debug(...args);
    }
  }
  /**
   * Attach spinner to native console output.
   */
  startNativeConsoleCapture() {
    this.spinner.attachConsole = true;
  }
  /**
   * Detach spinner from native console output.
   */
  stopNativeConsoleCapture() {
    this.spinner.attachConsole = false;
  }
}

export default ConsoleLogger;
