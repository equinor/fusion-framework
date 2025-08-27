import type { AnyModule } from './types.js';

export interface IConsoleLogger {
  level: 0 | 1 | 2 | 3 | 4;
  debug(...msg: unknown[]): void;
  info(...msg: unknown[]): void;
  warn(...msg: unknown[]): void;
  error(...msg: unknown[]): void;
}
/**
 * @todo replace with proper logger
 */
export class ConsoleLogger implements IConsoleLogger {
  /** - 0-1-2-3 (error-warning-info-debug) if not provided only errors are logged */
  public level: 0 | 1 | 2 | 3 | 4 =
    (Number(process.env.FUSION_LOG_LEVEL) as 0 | 1 | 2 | 3 | 4) || 1;
  constructor(protected domain: string) {}

  /** @inheritdoc */
  protected _createMessage(msg: unknown[]): unknown[] {
    return [
      `%c FUSION FRAMEWORK %c ${this.domain} %c %s`,
      'background: rgb(179, 13, 47); color: white; padding: 1px;',
      'background: rgb(244, 244, 244); color: rgb(36, 55, 70); padding: 1px;',
      'background: none; color: inherit',
      ...msg.reduce((c: unknown[], n: unknown) => c.concat(n, '\n'), []),
    ];
  }

  debug(...msg: unknown[]) {
    this.level > 3 && console.debug(...this._createMessage(msg));
  }
  info(...msg: unknown[]) {
    this.level > 2 && console.info(...this._createMessage(msg));
  }
  warn(...msg: unknown[]) {
    this.level > 1 && console.warn(...this._createMessage(msg));
  }
  error(...msg: unknown[]) {
    this.level > 0 && console.error(...this._createMessage(msg));
  }
}

/**
 * Extends the {@link IConsoleLogger} interface to provide additional logging functionality
 * specific to modules. This interface includes a method for formatting module names
 * for consistent logging output.
 *
 * @remarks
 * Implementations should ensure that the `formatModuleName` method returns a string
 * representation of the module name, which can be used in log messages to identify
 * the source module.
 *
 * @see IConsoleLogger
 */
export interface IModuleConsoleLogger extends IConsoleLogger {
  /**
   * Formats the module name for logging purposes.
   *
   * @param moduleOrName - The module or its name to format.
   * @returns A formatted string representing the module name, suitable for console output.
   */
  formatModuleName(moduleOrName: string | AnyModule): string;
}

/**
 * A specialized logger that extends {@link ConsoleLogger} to provide enhanced formatting for module names.
 *
 * The `ModuleConsoleLogger` class implements the {@link IModuleConsoleLogger} interface and provides a method
 * to format module names with a distinctive style for console output, making them more readable and visually
 * distinct. The formatted name includes a package emoji and applies color and uppercase transformations.
 *
 * @example
 * ```typescript
 * const logger = new ModuleConsoleLogger();
 * logger.formatModuleName('MyModule'); // 📦 MY MODULE (styled in green)
 * ```
 */
export class ModuleConsoleLogger extends ConsoleLogger implements IModuleConsoleLogger {
  public formatModuleName(moduleOrName: string | AnyModule): string {
    const name = typeof moduleOrName === 'string' ? moduleOrName : moduleOrName.name;
    return `📦\u001b[1;32m${name.replace(/([A-Z])/g, ' $1').toUpperCase()}\x1b[0m`;
  }
}
