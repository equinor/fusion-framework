import {
  BaseConfigBuilder,
  type ConfigBuilderCallbackArgs,
} from '@equinor/fusion-framework-module';

import type {
  ContextNavigationHandlerConfig,
  ContextRoutingStrategy,
  RoutingStrategyId,
  ContextNavigationHandlerNavigatedDetail,
} from './types';

import { queryStrategy } from './strategies/query-strategy';
import { pathStrategy } from './strategies/path-strategy';

/**
 * Configurator for the context-navigation-handler module.
 *
 * Provides a fluent builder API for portal developers.
 *
 * @example
 * ```ts
 * enableContextNavigationHandler(configurator, (builder) => {
 *   builder.setPortalName('my-portal');
 *   builder.setDebug(true);
 *   builder.setUrlGuard(true);
 *   builder.setOnTransition((detail) => {
 *     console.log('Navigated:', detail.targetURL.pathname);
 *   });
 * });
 * ```
 */
export class ContextNavigationHandlerConfigurator extends BaseConfigBuilder<ContextNavigationHandlerConfig> {
  /**
   * Set the portal name used in debug output and event details.
   * @default 'Portal'
   */
  setPortalName(name: string): this {
    this._set('portalName', name);
    return this;
  }

  /**
   * Set the origin for constructing absolute URLs.
   * @default window.location.origin
   */
  setOrigin(origin: string): this {
    this._set('origin', origin);
    return this;
  }

  /**
   * Override a specific routing strategy implementation.
   *
   * @example
   * ```ts
   * builder.setStrategy('path', myCustomPathStrategy);
   * ```
   */
  setStrategy(id: RoutingStrategyId, strategy: ContextRoutingStrategy): this {
    // Build the full map by reading current state or defaults
    this._set('strategies', async (_args: ConfigBuilderCallbackArgs) => {
      const defaults = this.#defaultStrategies();
      defaults[id] = strategy;
      return defaults;
    });
    return this;
  }

  /**
   * Replace all strategy implementations at once.
   */
  setStrategies(strategies: Record<RoutingStrategyId, ContextRoutingStrategy>): this {
    this._set('strategies', strategies);
    return this;
  }

  /**
   * Enable or disable the URL guard.
   * When enabled, URL changes that drop context trigger automatic re-sync.
   * @default true
   */
  setUrlGuard(enabled: boolean): this {
    this._set('enableUrlGuard', enabled);
    return this;
  }

  /**
   * Enable or disable verbose debug logging.
   * @default false
   */
  setDebug(enabled: boolean): this {
    this._set('debug', enabled);
    return this;
  }

  /**
   * Set a side-effect hook called after each successful navigation.
   * Useful for legacy app router resets or telemetry.
   */
  setOnTransition(fn: (detail: ContextNavigationHandlerNavigatedDetail) => void): this {
    this._set('onTransition', async () => fn);
    return this;
  }

  protected override _createConfig(
    init: ConfigBuilderCallbackArgs,
    config: Partial<ContextNavigationHandlerConfig>,
  ) {
    if (!this._has('portalName')) {
      this._set('portalName', 'Portal');
    }
    if (!this._has('origin')) {
      this._set('origin', window.location.origin);
    }
    if (!this._has('strategies')) {
      this._set('strategies', this.#defaultStrategies());
    }
    if (!this._has('enableUrlGuard')) {
      this._set('enableUrlGuard', true);
    }
    if (!this._has('debug')) {
      this._set('debug', false);
    }

    return super._createConfig(init, config);
  }

  #defaultStrategies(): Record<RoutingStrategyId, ContextRoutingStrategy> {
    return {
      query: queryStrategy,
      path: pathStrategy,
      // Custom is resolved at runtime from app provider — this is the fallback
      custom: pathStrategy,
    };
  }
}
