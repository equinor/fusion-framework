import { legacyAddObservers, type MapWithAdd } from './legacy-add-observers.js';

/**
 * Ensures `window.agStyleInjectionState` is shimmed for AG Grid compatibility.
 *
 * AG Grid has (at least) two observed shapes for `agStyleInjectionState.grids`:
 * - `Set` (older) where code calls `grids.add(...)`
 * - `Map` (newer, v35+) where code calls `grids.get/set/delete(...)`
 *
 * In setups with multiple bundles (for example module federation), both shapes can
 * appear on the same page. To avoid runtime crashes, this shims the existing
 * instance in-place so it supports both APIs.
 *
 * Calls to the patched `add()` notify observers registered with {@link observeLegacyAdd},
 * after the map has been updated, so usage of the legacy assumption can be measured
 * without changing what `add()` does or returns.
 */
export const applyThemeShim = (): void => {
  // Nothing to shim outside a browser environment (e.g. SSR)
  if (typeof window !== 'object') return;

  const state = window.agStyleInjectionState;
  // AG Grid hasn't initialized its style injection state yet — nothing to shim
  if (!state) return;

  // Older AG Grid versions use a Set-like API on this state; only Map-shaped state needs shimming
  if (state.grids instanceof Map) {
    const grids = state.grids as MapWithAdd;

    // Patch in the legacy `add` method so both Set- and Map-based callers keep working
    if (typeof grids.add !== 'function') {
      const observers = new Set<() => void>();
      grids[legacyAddObservers] = observers;
      grids.add = (key: unknown): Map<unknown, unknown> => {
        grids.set(key, true);
        // #5081: report that a caller still relies on the legacy Set-like `add()` (AG Grid >35),
        // so the shim can be removed once usage stops. Observers never alter map behavior.
        for (const observer of observers) {
          try {
            observer();
          } catch {
            // Diagnostics must not break grid style injection.
          }
        }
        return grids;
      };
    }
    // Ensure the companion WeakMap used by newer AG Grid versions is also present
    if (!(state.map instanceof WeakMap)) {
      state.map = new WeakMap();
    }
  }
};

declare global {
  interface Window {
    agStyleInjectionState?: {
      grids?: Map<unknown, unknown> | Set<unknown>;
      map?: unknown;
    };
  }
}
