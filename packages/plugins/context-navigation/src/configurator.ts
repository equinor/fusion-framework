import type { ContextNavigationConfig, ContextNavigationNavigatedDetail } from './types';
import type { ContextNavigationAdapterInput } from './adapters/types';
import type { ReconcilerSourceFactory } from './sources/types';

import { createPathAdapter } from './adapters/path-adapter';
import { createQueryAdapter } from './adapters/query-adapter';
import { createCustomAdapter } from './adapters/custom-adapter';
import { createResolveContextFromUrl } from './utils/resolve-context-from-url';
import { createAppFirstSource } from './sources/app-first-source';

/**
 * Resolves the default origin used for URL construction.
 *
 * Browser environments use `window.location.origin`. Non-browser environments
 * fall back to a stable localhost origin so tests and SSR code can still build
 * deterministic URLs.
 *
 * @returns The origin string used by the context-navigation plugin.
 */
const resolveDefaultOrigin = (): string =>
  typeof window === 'undefined' ? 'http://localhost' : window.location.origin;

/**
 * Configurator for the context-navigation plugin.
 *
 * Provides a fluent builder API for portal developers.
 * Adapters are registered with priority — the first adapter whose
 * `canHandle()` returns `true` is used for navigation.
 *
 * @example
 * ```ts
 * enableContextNavigation(configurator, (builder) => {
 *   builder.setPortalName('my-portal');
 *   builder.setDebug(true);
 *   // Custom adapters registered at higher priority override defaults
 *   builder.registerAdapter(myHashAdapter);
 * });
 * ```
 */
export class ContextNavigationConfigurator {
  readonly #config: Partial<ContextNavigationConfig> = {};
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
   * Set the portal name used in debug output.
   * @default 'Portal'
   */
  setPortalName(name: string): this {
    this.#config.portalName = name;
    return this;
  }

  /**
   * Set the origin for constructing absolute URLs.
   * @default window.location.origin
   */
  setOrigin(origin: string): this {
    this.#config.origin = origin;
    return this;
  }

  /**
   * Enable or disable the URL guard.
   * @default true
   */
  setUrlGuard(enabled: boolean): this {
    this.#config.enableUrlGuard = enabled;
    return this;
  }

  /**
   * Enable or disable verbose debug logging.
   * @default false
   */
  setDebug(enabled: boolean): this {
    this.#config.debug = enabled;
    return this;
  }

  /**
   * Set a function that computes the URL to navigate to when context is cleared.
   *
   * When set, the reconciler bypasses adapter encoding for null context
   * and navigates directly to the returned URL. Use in context-portal where
   * clearing context should return to the portal landing page.
   *
   * Accepts either a static string (shorthand) or a function that receives
   * the current app key and URL for dynamic path construction.
   *
   * @param urlOrFn - A static path (e.g. `'/'`) or a function returning one.
   */
  setNullContextUrl(
    urlOrFn: string | ((args: { appKey: string; currentURL: URL }) => string),
  ): this {
    this.#config.nullContextUrl = typeof urlOrFn === 'string' ? () => urlOrFn : urlOrFn;
    return this;
  }

  /**
   * Set a side-effect hook called after each successful navigation.
   */
  setOnTransition(fn: (detail: ContextNavigationNavigatedDetail) => void): this {
    this.#config.onTransition = fn;
    return this;
  }

  /**
   * Set the options passed to `navigation.navigate()` during URL updates.
   *
   * @default { replace: true }
   */
  setNavigationOptions(options: { replace?: boolean; state?: unknown }): this {
    this.#config.navigationOptions = options;
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
    this.#config.sourceFactory = factory;
    return this;
  }

  /**
   * Builds the resolved plugin configuration from the registered options.
   *
   * @returns The resolved configuration used by the context-navigation plugin.
   */
  createConfig(): ContextNavigationConfig {
    const origin = this.#config.origin ?? resolveDefaultOrigin();

    // If user registered adapters, use those exclusively.
    // Otherwise fall back to built-in defaults (custom → query → path).
    const adapters =
      this.#adapters.length > 0
        ? [...this.#adapters]
        : [createCustomAdapter(), createQueryAdapter(), createPathAdapter()];

    return {
      portalName: this.#config.portalName ?? 'Portal',
      origin,
      enableUrlGuard: this.#config.enableUrlGuard ?? true,
      debug: this.#config.debug ?? false,
      nullContextUrl: this.#config.nullContextUrl,
      onTransition: this.#config.onTransition,
      navigationOptions: this.#config.navigationOptions ?? { replace: true },
      sourceFactory: this.#config.sourceFactory ?? createAppFirstSource(),
      resolveInitialContext:
        this.#config.resolveInitialContext ?? createResolveContextFromUrl(adapters, origin),
      adapters,
    };
  }
}
