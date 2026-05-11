import {
  BaseConfigBuilder,
  type ConfigBuilderCallbackArgs,
} from '@equinor/fusion-framework-module';

import type {
  ContextNavigationHandlerConfig,
  ContextNavigationAdapterInput,
  ContextNavigationHandlerNavigatedDetail,
  ReconcilerSourceFactory,
} from './types';

import { createPathAdapter } from './adapters/path-adapter';
import { createQueryAdapter } from './adapters/query-adapter';
import { createCustomAdapter } from './adapters/custom-adapter';
import { createResolveContextFromUrl } from './utils/resolve-context-from-url';
import { createAppFirstSource } from './sources/app-first-source';

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
  readonly #adapters: ContextNavigationAdapterInput[] = [];

  /**
   * Register a navigation adapter or adapter factory.
   *
   * - **Object** — a static adapter with `canHandle`, `encode`, `decode`.
   * - **Function** — a factory called with the resolution context that
   *   returns a bound adapter or `null` to skip.
   *
   * Adapters are evaluated in registration order. The first match wins.
   *
   * **Note:** Registering any adapter disables the built-in defaults
   * (custom, query, path). Register all adapters you need explicitly.
   */
  registerAdapter(adapter: ContextNavigationAdapterInput): this {
    this.#adapters.push(adapter);
    return this;
  }

  /**
   * Register multiple navigation adapters at once.
   * Adapters are appended in the order provided.
   *
   * **Note:** Registering any adapter disables the built-in defaults
   * (custom, query, path). Register all adapters you need explicitly.
   */
  registerAdapters(adapters: readonly ContextNavigationAdapterInput[]): this {
    for (const adapter of adapters) {
      this.#adapters.push(adapter);
    }
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
   * Set the URL to navigate to when context is cleared.
   *
   * When set, the reconciler bypasses adapter encoding for null context
   * and navigates directly to this URL. Use in context-portal where
   * clearing context should return to the portal landing page.
   *
   * @param url - The target URL path (e.g. `'/'`).
   */
  setNullContextUrl(url: string): this {
    this._set('nullContextUrl', url);
    return this;
  }

  /**
   * Set a side-effect hook called after each successful navigation.
   */
  setOnTransition(fn: (detail: ContextNavigationHandlerNavigatedDetail) => void): this {
    this._set('onTransition', async () => fn);
    return this;
  }

  /**
   * Set the source factory that drives the reconciler's observable stream.
   *
   * @default createAppFirstSource()
   * @see createAppFirstSource
   * @see createContextFirstSource
   */
  setSourceFactory(factory: ReconcilerSourceFactory): this {
    this._set('sourceFactory', async () => factory);
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

    // If user registered adapters, use those exclusively.
    // Otherwise fall back to built-in defaults (custom → query → path).
    const allAdapters =
      this.#adapters.length > 0
        ? [...this.#adapters]
        : [createCustomAdapter(), createQueryAdapter(), createPathAdapter()];

    this._set('adapters', allAdapters);

    // Default source factory — app-first (app switches lead).
    if (!this._has('sourceFactory')) {
      const factory = createAppFirstSource();
      this._set('sourceFactory', async () => factory);
    }

    // Default initial context resolver — decode URL via adapters, set on context provider.
    if (!this._has('resolveInitialContext')) {
      const resolver = createResolveContextFromUrl(allAdapters);
      this._set('resolveInitialContext', async () => resolver);
    }

    return super._createConfig(init, config);
  }
}
