import {
  BaseConfigBuilder,
  type ConfigBuilderCallbackArgs,
} from '@equinor/fusion-framework-module';

import type {
  ContextNavigationHandlerConfig,
  ContextNavigationAdapter,
  ContextNavigationHandlerNavigatedDetail,
} from './types';

import { createPathAdapter } from './adapters/path-adapter';
import { createQueryAdapter } from './adapters/query-adapter';
import { createCustomAdapter } from './adapters/custom-adapter';

/**
 * Configurator for the context-navigation-handler module.
 *
 * Provides a fluent builder API for portal developers.
 * Adapters are registered with priority — the first adapter whose
 * `canHandle()` returns `true` is used for navigation.
 *
 * @example
 * ```ts
 * enableContextNavigationHandler(configurator, (builder) => {
 *   builder.setPortalName('my-portal');
 *   builder.setDebug(true);
 *   // Custom adapters registered at higher priority override defaults
 *   builder.registerAdapter(myHashAdapter);
 * });
 * ```
 */
export class ContextNavigationHandlerConfigurator extends BaseConfigBuilder<ContextNavigationHandlerConfig> {
  readonly #adapters: ContextNavigationAdapter[] = [];

  /**
   * Register a navigation adapter.
   * Adapters are evaluated by priority (highest first). The first adapter
   * whose `canHandle()` returns `true` is used.
   */
  registerAdapter(adapter: ContextNavigationAdapter): this {
    this.#adapters.push(adapter);
    return this;
  }

  /**
   * Set the portal name used in debug output.
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
   * Enable or disable the URL guard.
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
    if (!this._has('enableUrlGuard')) {
      this._set('enableUrlGuard', true);
    }
    if (!this._has('debug')) {
      this._set('debug', false);
    }

    // User-registered adapters first (override defaults), then built-in defaults.
    // First match wins — order is evaluation order.
    const allAdapters = [
      ...this.#adapters,
      createCustomAdapter(),
      createQueryAdapter(),
      createPathAdapter(),
    ];

    this._set('adapters', allAdapters);

    return super._createConfig(init, config);
  }
}
