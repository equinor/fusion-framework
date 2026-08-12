import { v7 as generateId } from 'uuid';

import { createHistory } from '../lib/create-history';
import { Action, type To } from '../lib/types';
import { resolvePath } from '../lib/utils';
import { NavigationConfigurator } from '../NavigationConfigurator';

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
   * Creates the configurator with memory history already set as the default,
   * overriding {@link NavigationConfigurator}'s `window`-dependent fallback.
   */
  constructor() {
    super();
    this.setHistory(createHistory('memory'));
  }

  /**
   * Seeds the location the memory history starts at, so a test can assert
   * against a specific route without an initial `navigate()` call.
   *
   * @param to - The path to seed as the current location.
   * @param state - Optional state to attach to the seeded location.
   * @returns The configurator instance for method chaining.
   */
  public setInitialLocation(to: To, state: unknown = null): this {
    const path = resolvePath(to);
    this.setHistory(
      createHistory('memory', {
        initialLocation: {
          delta: 0,
          action: Action.Pop,
          location: { ...path, state, key: generateId(), unstable_mask: undefined },
        },
      }),
    );
    return this;
  }
}
