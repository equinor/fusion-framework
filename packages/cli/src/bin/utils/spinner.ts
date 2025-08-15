import ora, { type Options, type Ora } from 'ora';

/**
 * Spinner utility class for CLI progress indication and logging.
 * Wraps the `ora` spinner and provides additional features for console capture and global state.
 *
 * @remarks
 * - Allows attaching/detaching spinner to native console output.
 * - Supports global and cloneable spinner instances.
 * - Provides info, success, warning, and failure logging methods.
 *
 * @example
 * const spinner = new Spinner({ text: 'Loading...' });
 * spinner.start('Processing');
 * spinner.succeed('Done!');
 */
export class Spinner {
  /**
   * Internal ora spinner instance.
   */
  #ora: Ora;

  /**
   * Get the underlying ora instance for advanced usage.
   */
  get ora(): Ora {
    return this.#ora;
  }

  /**
   * Attach or detach spinner to native console output.
   * When enabled, console.log/info are redirected to spinner.info.
   */
  set attachConsole(value: boolean) {
    if (value) {
      console.log = this.info.bind(this);
      console.info = this.info.bind(this);
    } else {
      // biome-ignore lint/suspicious/noGlobalAssign: duh
      console = originalConsole;
    }
  }

  /**
   * Create and set a global spinner instance.
   * @param options - Spinner options.
   * @returns The global spinner instance.
   */
  static Global(options?: Options) {
    _spinner = new Spinner(options);
    return _spinner;
  }

  /**
   * Clone a spinner instance, optionally from an existing spinner.
   * @param spinner - Spinner to clone from, or use global spinner if omitted.
   * @returns A new Spinner instance with the same prefixText.
   */
  static Clone(spinner?: Spinner) {
    const { prefixText } = spinner || _spinner;
    return new Spinner({ prefixText });
  }

  /**
   * Get the current global spinner instance.
   */
  static get Current(): Spinner {
    return _spinner;
  }

  /**
   * Set the current global spinner instance.
   */
  static set Current(spinner: Spinner) {
    _spinner = spinner;
  }

  /**
   * Create a new Spinner instance.
   * @param options - Spinner options from ora.
   */
  constructor(options?: Options) {
    this.#ora = ora(options);
  }

  /**
   * Get the prefix text for the spinner.
   */
  get prefixText() {
    return this.#ora.prefixText;
  }

  /**
   * Log an informational message with the spinner.
   * @param args - Message parts to display.
   */
  info(...args: string[]) {
    this.#ora.info(parseArgs(args));
  }

  /**
   * Mark spinner as succeeded with a message.
   * @param args - Message parts to display.
   */
  succeed(...args: string[]) {
    this.#ora.succeed(parseArgs(args));
  }

  /**
   * Start the spinner with a message.
   * @param args - Message parts to display.
   */
  start(...args: string[]) {
    this.#ora.start(parseArgs(args));
  }

  /**
   * Mark spinner as failed with a message.
   * @param args - Message parts to display.
   */
  fail(...args: string[]) {
    this.#ora.fail(parseArgs(args));
  }

  /**
   * Log a warning message with the spinner.
   * @param args - Message parts to display.
   */
  warn(...args: string[]) {
    this.#ora.warn(parseArgs(args));
  }

  /**
   * Clear the spinner output.
   */
  clear() {
    this.#ora.clear();
  }

  /**
   * Stop the spinner without marking as success or failure.
   */
  stop() {
    this.#ora.stop();
  }

  /**
   * Stop the spinner and persist output with custom options.
   * @param args - Arguments for ora's stopAndPersist.
   */
  stopAndPersist(...args: Parameters<Ora['stopAndPersist']>) {
    this.#ora.stopAndPersist(...args);
  }
}

let _spinner = new Spinner();

const parseArgs = (args: string[]): string | undefined =>
  args.length ? args.join(' ') : undefined;

const originalConsole = console;

export type { Options as SpinnerOptions } from 'ora';
