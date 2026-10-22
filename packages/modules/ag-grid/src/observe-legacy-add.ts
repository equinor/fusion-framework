import { legacyAddObservers, type MapWithAdd } from './legacy-add-observers.js';

/**
 * Observes invocations of the legacy `add()` patched by `applyThemeShim`.
 *
 * Only a patch installed by a Fusion AG Grid shim that supports observers can be observed;
 * when the current page has no such patch, the observer is never called.
 *
 * @param observer - Called synchronously after each patched `add()` invocation.
 * @returns A function that stops observing; safe to call more than once.
 */
export const observeLegacyAdd = (observer: () => void): (() => void) => {
  // Without a browser window there is no shared style injection state to observe.
  if (typeof window !== 'object') return () => {};
  const grids = window.agStyleInjectionState?.grids as MapWithAdd | undefined;
  const observers = grids instanceof Map ? grids[legacyAddObservers] : undefined;
  // An unpatched or foreign-patched state exposes no observer registry.
  if (!observers) return () => {};
  observers.add(observer);
  return () => {
    observers.delete(observer);
  };
};
