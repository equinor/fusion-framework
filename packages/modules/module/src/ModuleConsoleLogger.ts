import type { AnyModule } from './types.js';
import { ConsoleLogger, type IConsoleLogger } from './ConsoleLogger.js';

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
  /**
   * Formats the module name for logging purposes.
   *
   * @param moduleOrName - The module or its name to format.
   * @returns A formatted string representing the module name, suitable for console output.
   */
  public formatModuleName(moduleOrName: string | AnyModule): string {
    const name = typeof moduleOrName === 'string' ? moduleOrName : moduleOrName.name;
    return `📦\u001b[1;32m${name.replace(/([A-Z])/g, ' $1').toUpperCase()}\x1b[0m`;
  }
}

export default ModuleConsoleLogger;
