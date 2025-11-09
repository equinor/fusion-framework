import { z } from 'zod';
import { of, type ObservableInput } from 'rxjs';
import {
  BaseConfigBuilder,
  type ModulesInstance,
  type ConfigBuilderCallback,
  type ConfigBuilderCallbackArgs,
} from '@equinor/fusion-framework-module';
import type { ITelemetryProvider } from '@equinor/fusion-framework-module-telemetry';
import type { IEventModuleProvider } from '@equinor/fusion-framework-module-event';
import type { INavigationConfigurator } from './NavigationConfigurator.interface';

import type { History } from './lib/types';
import { createHistory } from './lib/create-history';
import type { NavigationModule } from './module';

/**
 * Zod schema for navigation module configuration validation.
 *
 * @internal
 */
const navigationConfigSchema = z
  .object({
    basename: z
      .string()
      .optional()
      .describe(
        'Base pathname for the application (e.g., "/app"). Must match the URL path prefix where your app is served. The router requires the pathname to start with this basename.',
      ),
    history: z
      .custom<History>()
      .describe(
        'Custom history instance implementing the History interface. Defaults to browser history if not provided. Use createHistory("browser"|"hash"|"memory") to create instances.',
      ),
    telemetry: z
      .custom<ITelemetryProvider>()
      .optional()
      .describe(
        'Telemetry provider for tracking navigation events. Used to log navigation actions, location changes, and errors for monitoring and debugging.',
      ),
    eventProvider: z
      .custom<IEventModuleProvider>()
      .optional()
      .describe(
        'Event provider for dispatching navigation events (NavigateEvent, NavigatedEvent). Allows other modules to listen for navigation changes and block navigation attempts.',
      ),
  })
  .describe(
    'Validates navigation module configuration settings for routing and navigation capabilities.',
  );

/**
 * Parses and validates a navigation configuration object.
 *
 * @param config - The configuration object to parse
 * @returns Validated navigation configuration
 * @throws {z.ZodError} If the configuration is invalid
 */
const parseNavigationConfig = (config: unknown): INavigationConfigurator => {
  return navigationConfigSchema.parse(config);
};

/**
 * Configurator class for navigation module settings.
 * Extends BaseConfigBuilder to provide fluent configuration API with Zod validation.
 */
export class NavigationConfigurator extends BaseConfigBuilder<INavigationConfigurator> {
  constructor() {
    super();
    this.setEventProvider(async (args) => {
      if (args.hasModule('event')) {
        return await args.requireInstance('event');
      }
    });
    this.setHistory(async (args) => {
      const history = (args.ref as ModulesInstance<[NavigationModule]>)?.navigation?.history;
      if (history) {
        return history;
      }
      if (typeof window !== 'undefined') {
        return createHistory('browser');
      }
      return createHistory('memory');
    });
  }
  /**
   * @deprecated Use `setBasename()` method instead
   */
  public set basename(value: string | undefined) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('NavigationConfigurator.basename', 'use setBasename() method instead');
    }
    this.setBasename(value);
  }

  /**
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
   *
   * @param basenameOrCallback - Basename string or configuration callback
   * @returns The configurator instance for method chaining
   */
  public setBasename(basenameOrCallback?: string | ConfigBuilderCallback<string>): this {
    const fn =
      typeof basenameOrCallback === 'function'
        ? basenameOrCallback
        : async () => basenameOrCallback;
    this._set('basename', fn);
    return this;
  }

  /**
   * Sets a custom history instance for the navigation module.
   *
   * @param historyOrCallback - History instance or configuration callback
   * @returns The configurator instance for method chaining
   */
  public setHistory(historyOrCallback?: History | ConfigBuilderCallback<History>): this {
    const fn =
      typeof historyOrCallback === 'function' ? historyOrCallback : async () => historyOrCallback;
    this._set('history', fn);
    return this;
  }

  /**
   * Sets telemetry configuration for navigation-specific events.
   *
   * @param telemetryOrCallback - Telemetry provider instance or configuration callback
   * @returns The configurator instance for method chaining
   */
  public setTelemetry(
    telemetryOrCallback: ITelemetryProvider | ConfigBuilderCallback<ITelemetryProvider>,
  ): this {
    const fn =
      typeof telemetryOrCallback === 'function'
        ? telemetryOrCallback
        : async () => telemetryOrCallback;
    this._set('telemetry', fn);
    return this;
  }

  /**
   * Sets event provider for dispatching navigation events.
   *
   * @param eventProviderOrCallback - Event provider instance or configuration callback
   * @returns The configurator instance for method chaining
   */
  public setEventProvider(
    eventProviderOrCallback: IEventModuleProvider | ConfigBuilderCallback<IEventModuleProvider>,
  ): this {
    const fn =
      typeof eventProviderOrCallback === 'function'
        ? eventProviderOrCallback
        : async () => eventProviderOrCallback;
    this._set('eventProvider', fn);
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
    return of(parseNavigationConfig(config));
  }
}
