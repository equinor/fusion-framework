import type { ConfigBuilderCallback } from '@equinor/fusion-framework-module';
import { v7 as generateId } from 'uuid';

import { createHistory } from '../lib/create-history';
import { Action, type To } from '../lib/types';
import { resolvePath } from '../lib/utils';
import { NavigationConfigurator } from '../NavigationConfigurator';

// Mirrors NavigationProvider's private helper of the same name — collapses repeated
// slashes so a prepended basename never produces a doubled or trailing separator.
const normalizePathname = (path: string) => path.replace(/\/+/g, '/').replace(/\/$/, '');

/**
 * Navigation configurator for tests: always resolves to {@link MemoryHistory},
 * regardless of whether `window` is defined.
 *
 * @remarks
 * The real configurator falls back to browser history whenever `window`
 * exists — true in a happy-dom/jsdom test environment — so a test would
 * otherwise navigate (and leak state across test cases via) the real,
 * shared document location. Forcing memory history is the only behavioral
 * difference from {@link NavigationConfigurator}.
 */
export class NavigationMockConfigurator extends NavigationConfigurator {
  /**
   * Basename seen through {@link setBasename}, cached so {@link setInitialLocation}
   * can prepend it without waiting for the async config-builder resolution.
   */
  #basename?: string;

  /**
   * Creates the configurator with memory history already set as the default,
   * overriding {@link NavigationConfigurator}'s `window`-dependent fallback.
   */
  constructor() {
    super();
    // proxy: false — this memory history is created and owned by the mock itself,
    // matching NavigationConfigurator's own default-history path, so it is torn
    // down on dispose instead of being silently kept alive by an unowned ProxyHistory.
    this.setHistory(createHistory('memory'), { proxy: false });
  }

  /**
   * @param basenameOrCallback - Basename string or configuration callback.
   * @returns The configurator instance for method chaining.
   */
  public override setBasename(basenameOrCallback?: string | ConfigBuilderCallback<string>): this {
    // Only a plain string is knowable synchronously; a callback resolves later
    // through the real config builder and is left out of setInitialLocation's basename.
    this.#basename = typeof basenameOrCallback === 'string' ? basenameOrCallback : undefined;
    return super.setBasename(basenameOrCallback);
  }

  /**
   * Seeds the location the memory history starts at, so a test can assert
   * against a specific route without an initial `navigate()` call.
   *
   * @remarks
   * `to` is basename-relative, matching {@link NavigationProvider.navigate}/`push`/`replace` —
   * call `setBasename()` first if the seeded route should be scoped under one.
   *
   * @param to - The path to seed as the current location, relative to the configured basename.
   * @param state - Optional state to attach to the seeded location.
   * @returns The configurator instance for method chaining.
   */
  public setInitialLocation(to: To, state: unknown = null): this {
    const path = resolvePath(to);
    const pathname = normalizePathname(`${this.#basename ?? ''}/${path.pathname}`);
    this.setHistory(
      createHistory('memory', {
        initialLocation: {
          delta: 0,
          action: Action.Pop,
          location: { ...path, pathname, state, key: generateId(), unstable_mask: undefined },
        },
      }),
      // proxy: false — same ownership reasoning as the constructor's default history.
      { proxy: false },
    );
    return this;
  }
}
