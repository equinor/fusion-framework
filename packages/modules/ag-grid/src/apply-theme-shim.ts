/**
 * Extends a `Map` with an optional `add` API to support legacy Set-like usage.
 */
type MapWithAdd = Map<unknown, unknown> & {
  add?: (key: unknown) => Map<unknown, unknown>;
};

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
 */
export const applyThemeShim = (): void => {
  if (typeof window !== 'object') return;

  const state = window.agStyleInjectionState;
  if (!state) return;

  if (state.grids instanceof Map) {
    const grids = state.grids as MapWithAdd;

    if (typeof grids.add !== 'function') {
      grids.add = (key: unknown): Map<unknown, unknown> => {
        // TODO: Add telemetry when available. This should log when `add` is missing
        // and we patch Map-based grid state for legacy AG Grid assumptions (requested marker: ">35").
        grids.set(key, true);
        return grids;
      };
    }
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
