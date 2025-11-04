import { z } from 'zod';
import { of, type ObservableInput } from 'rxjs';
import type { History } from './types';
import {
  BaseConfigBuilder,
  type ConfigBuilderCallback,
  type ConfigBuilderCallbackArgs,
} from '@equinor/fusion-framework-module';
import { createHistory } from './createHistory';

/**
 * Zod schema for navigation module configuration validation.
 *
 * @internal
 */
export const navigationConfigSchema = z.object({
  /** Optional base pathname for the application (e.g., "/app") */
  basename: z.string().optional().describe('Base pathname for the application'),
  /** Optional custom history instance (browser, hash, or memory). If not provided, defaults to browser history. */
  history: z.custom<History>().describe('Custom history instance of History interface'),
});

/**
 * Configuration object for the navigation module.
 * Provides options for customizing history and basename settings.
 */
export type INavigationConfigurator = z.infer<typeof navigationConfigSchema>;

/**
 * Parses and validates a navigation configuration object.
 *
 * @param config - The configuration object to parse
 * @returns Validated navigation configuration
 * @throws {z.ZodError} If the configuration is invalid
 */
export const parseNavigationConfig = (config: unknown): INavigationConfigurator => {
  return navigationConfigSchema.parse(config);
};

/**
 * Configurator class for navigation module settings.
 * Extends BaseConfigBuilder to provide fluent configuration API with Zod validation.
 *
 * @remarks
 * This configurator allows setting:
 * - Basename for the application (e.g., "/app")
 * - Custom history instance (browser, hash, or memory)
 *
 * Configuration is validated using Zod schema before being used.
 *
 * Supports both modern method-based configuration and legacy property-based configuration.
 *
 * @example
 * ```ts
 * // Modern method-based approach (recommended)
 * const configurator = new NavigationConfigurator();
 * configurator.setBasename('/app');
 * configurator.setHistory(createBrowserHistory());
 *
 * // Legacy property-based approach (backward compatibility)
 * const configurator = new NavigationConfigurator();
 * configurator.basename = '/app';
 * configurator.history = createBrowserHistory();
 * ```
 */
export class NavigationConfigurator extends BaseConfigBuilder<INavigationConfigurator> {
  constructor() {
    super();
    this.setHistory(async () => createHistory());
  }

  /**
   * Legacy property setter for basename.
   * For backward compatibility, allows setting basename as a property.
   * This internally calls `setBasename()` with the provided value.
   * Setting `undefined` will clear the configured value.
   *
   * @deprecated Use `setBasename()` method instead
   */
  public set basename(value: string | undefined) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('NavigationConfigurator.basename', 'use setBasename() method instead');
    }
    this.setBasename(value);
  }

  /**
   * Legacy property setter for history.
   * For backward compatibility, allows setting history as a property.
   * This internally calls `setHistory()` with the provided value.
   * Setting `undefined` will clear the configured value.
   *
   * @deprecated Use `setHistory()` method instead
   */
  public set history(value: History | undefined) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('NavigationConfigurator.history', 'use setHistory() method instead');
    }
    this.setHistory(value);
  }

  /**
   * Sets the basename for the application.
   * The basename is prepended to all routes when using the navigation module.
   *
   * @param basenameOrCallback - Basename string or configuration callback that returns the basename string
   * @returns The configurator instance for method chaining
   *
   * @example
   * ```ts
   * // Simple string value
   * configurator.setBasename('/app');
   *
   * // Callback function
   * configurator.setBasename(() => '/app');
   * ```
   */
  public setBasename(basenameOrCallback?: string | ConfigBuilderCallback<string>): this {
    console.log(11111, 'NavigationConfigurator::setBasename', basenameOrCallback);
    const fn =
      typeof basenameOrCallback === 'function'
        ? basenameOrCallback
        : async () => basenameOrCallback;
    this._set('basename', fn);
    return this;
  }

  /**
   * Sets a custom history instance for the navigation module.
   * If not set, defaults to browser history.
   *
   * @param historyOrCallback - History instance or configuration callback that returns a History instance
   * @returns The configurator instance for method chaining
   *
   * @example
   * ```ts
   * // Direct history instance
   * configurator.setHistory(createHashHistory());
   *
   * // Callback function
   * configurator.setHistory(() => createHashHistory());
   * ```
   */
  public setHistory(historyOrCallback?: History | ConfigBuilderCallback<History>): this {
    const fn =
      typeof historyOrCallback === 'function' ? historyOrCallback : async () => historyOrCallback;
    this._set('history', fn);
    return this;
  }

  /**
   * Processes and validates the configuration using Zod schema.
   *
   * @param config - Raw configuration object from builder
   * @param _init - Configuration builder callback arguments (unused)
   * @returns Observable that emits validated and processed configuration object
   * @throws {z.ZodError} If the configuration is invalid
   *
   * @protected
   */
  protected _processConfig(
    config: Partial<INavigationConfigurator>,
    _init: ConfigBuilderCallbackArgs,
  ): ObservableInput<INavigationConfigurator> {
    // Validate configuration using Zod schema
    // This ensures type safety and runtime validation
    // Return as observable (wrapped in of() to satisfy ObservableInput type)
    return of(parseNavigationConfig(config));
  }
}
