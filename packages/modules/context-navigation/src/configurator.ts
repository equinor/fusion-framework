import {
  BaseConfigBuilder,
  type ConfigBuilderCallback,
  type ConfigBuilderCallbackArgs,
} from '@equinor/fusion-framework-module';

import type {
  ContextNavigationConfig,
  OnStrategyDetectedCallback,
  NullContextHandler,
  SourceFactory,
  TelemetryTracker,
} from './types';

import type { RoutingExecutionMode } from './orchestrator/routing-mode-orchestrator';

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
   * Register a callback that fires when a routing strategy is detected on a loaded app.
   *
   * The module fires this for every strategy mode, not just custom.
   * Portals decide which modes deserve special handling.
   */
  setOnStrategyDetected(callback: OnStrategyDetectedCallback): this {
    this._set('onStrategyDetected', async () => callback);
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
   * Set which routing execution modes trigger a `console.warn` when detected.
   *
   * For example, Fusion Portal uses `['custom']` to discourage apps from using
   * custom URL strategies. Other portals might warn on `['legacy']` instead.
   *
   * @example
   * ```ts
   * builder.setWarnOnStrategies(['custom', 'legacy']);
   * ```
   */
  setWarnOnStrategies(modes: RoutingExecutionMode[]): this {
    this._set('warnOnStrategies', modes);
    return this;
  }

  /**
   * Set the telemetry tracker for navigation events.
   *
   * Accepts a direct tracker instance or a callback that resolves one
   * from module init args (same pattern as `NavigationConfigurator.setTelemetry`).
   *
   * By default, the module auto-resolves the framework telemetry module
   * if registered. Use this to override with a custom implementation.
   *
   * @example
   * ```ts
   * // Use framework telemetry (default — no call needed)
   *
   * // Override with custom tracker
   * builder.setTelemetry(myCustomTracker);
   *
   * // Resolve from module args (same as navigation module pattern)
   * builder.setTelemetry(async (args) => {
   *   if (args.hasModule('telemetry')) {
   *     return await args.requireInstance('telemetry');
   *   }
   * });
   * ```
   */
  setTelemetry(
    trackerOrCallback: TelemetryTracker | ConfigBuilderCallback<TelemetryTracker>,
  ): this {
    const fn =
      typeof trackerOrCallback === 'function' ? trackerOrCallback : async () => trackerOrCallback;
    this._set('telemetry', fn);
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
    if (!this._has('warnOnStrategies')) {
      this._set('warnOnStrategies', []);
    }
    if (!this._has('consoleDebug')) {
      this._set('consoleDebug', false);
    }
    if (!this._has('enableContextUrlGuard')) {
      this._set('enableContextUrlGuard', true);
    }

    // Auto-resolve framework telemetry module if no explicit tracker was set
    if (!this._has('telemetry')) {
      this._set('telemetry', async (args: ConfigBuilderCallbackArgs) => {
        if (args.hasModule('telemetry')) {
          return await args.requireInstance('telemetry');
        }
      });
    }

    return super._createConfig(init, config);
  }
}
