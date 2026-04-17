import {
  BaseConfigBuilder,
  type ConfigBuilderCallbackArgs,
} from '@equinor/fusion-framework-module';

import type {
  ContextNavigationConfig,
  OnCustomStrategyDetectedCallback,
  NullContextHandler,
  SourceFactory,
} from './types';

import { createAppFirstSource } from './sources/app-first-source';

/**
 * Configurator for the context navigation module.
 *
 * Extends `BaseConfigBuilder` — portals call setter methods directly on
 * the configurator instance passed to `enableContextNavigation`.
 *
 * @example
 * ```ts
 * enableContextNavigation(configurator, (builder) => {
 *   builder.setPortalName('app-portal');
 *   builder.setConsoleDebug(true);
 *   builder.setWarnOnCustomStrategy(true);
 *   builder.enableTelemetry(true);
 *   builder.setOnCustomStrategyDetected((appKey) => {
 *     console.warn(`App [${appKey}] uses custom strategy`);
 *   });
 * });
 * ```
 */
export class ContextNavigationConfigurator extends BaseConfigBuilder<ContextNavigationConfig> {
  /**
   * Set the human-readable portal name used in log output.
   * Defaults to `'Portal'`.
   */
  setPortalName(name: string): this {
    this._set('portalName', name);
    return this;
  }

  /**
   * Override the source factory that drives subscription 1.
   *
   * Default: `createAppFirstSource()` — `app.current$` × `context$`.
   * Context-portal: `createContextFirstSource()` — `context$` × `app.current$`.
   */
  setSourceFactory(factory: SourceFactory): this {
    this._set('sourceFactory', async () => factory);
    return this;
  }

  /**
   * Register a handler for null context (context cleared).
   * Returns a navigation instruction that overrides the adapter default,
   * or `undefined` to fall through.
   */
  setNullContextHandler(handler: NullContextHandler): this {
    this._set('nullContextHandler', async () => handler);
    return this;
  }
  /**
   * Enable or disable app-switch context carry-over.
   *
   * When disabled, navigating to a new app won't auto-inject the current
   * context into the URL. The context stream emission handles it instead.
   *
   * Context-portal may want this disabled since context drives app selection.
   */
  enableAppSwitchCarryOver(enabled: boolean): this {
    this._set('enableAppSwitchCarryOver', enabled);
    return this;
  }

  /**
   * Register a callback that fires when a loaded app uses `routingStrategy: 'custom'`.
   *
   * The module does NOT treat custom as deprecated — apps may legitimately
   * own their URL shape. This callback lets portals decide how to respond.
   */
  setOnCustomStrategyDetected(callback: OnCustomStrategyDetectedCallback): this {
    this._set('onCustomStrategyDetected', async () => callback);
    return this;
  }

  /**
   * Enable verbose console.debug logging for all context navigation operations.
   * Use in dev environments; keep disabled in production.
   */
  setConsoleDebug(enabled: boolean): this {
    this._set('consoleDebug', enabled);
    return this;
  }

  /**
   * When enabled, emits `console.warn` when a loaded app uses custom routing strategy.
   * Convenience shorthand — for custom handling use `setOnCustomStrategyDetected`.
   */
  setWarnOnCustomStrategy(enabled: boolean): this {
    this._set('warnOnCustomStrategy', enabled);
    return this;
  }

  /**
   * Enable telemetry event tracking for context navigation.
   *
   * When enabled and the telemetry module is available, the provider
   * will call `trackEvent()` for:
   * - `context-navigation.context-change` — strategy, mode, appKey
   * - `context-navigation.app-switch` — carry-over result, appKey
   * - `context-navigation.custom-detected` — appKey
   */
  enableTelemetry(enabled: boolean): this {
    this._set('enableTelemetry', enabled);
    return this;
  }

  /**
   * Enable or disable the URL guard that re-applies the active context id
   * to the URL when it goes missing (e.g. after an in-app navigation that
   * accidentally drops the context parameter).
   *
   * Uses `replace` so it is invisible in browser history.
   *
   * @default true
   */
  enableContextUrlGuard(enabled: boolean): this {
    this._set('enableContextUrlGuard', enabled);
    return this;
  }

  protected override _createConfig(
    init: ConfigBuilderCallbackArgs,
    config: Partial<ContextNavigationConfig>,
  ) {
    // Apply defaults for any config key not explicitly set by the consumer
    if (!this._has('portalName')) {
      this._set('portalName', 'Portal');
    }
    if (!this._has('sourceFactory')) {
      this._set('sourceFactory', async () => createAppFirstSource());
    }
    if (!this._has('enableAppSwitchCarryOver')) {
      this._set('enableAppSwitchCarryOver', true);
    }
    if (!this._has('warnOnCustomStrategy')) {
      this._set('warnOnCustomStrategy', false);
    }
    if (!this._has('consoleDebug')) {
      this._set('consoleDebug', false);
    }
    if (!this._has('enableTelemetry')) {
      this._set('enableTelemetry', false);
    }
    if (!this._has('enableContextUrlGuard')) {
      this._set('enableContextUrlGuard', true);
    }

    return super._createConfig(init, config);
  }
}
