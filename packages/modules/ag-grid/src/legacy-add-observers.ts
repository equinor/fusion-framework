/**
 * Registry key for observers of the patched legacy `add()`.
 *
 * `Symbol.for` makes the key global, so a Fusion AG Grid provider in any federated bundle can
 * observe a patch installed by another bundle on the shared `agStyleInjectionState`.
 */
export const legacyAddObservers: unique symbol = Symbol.for(
  '@equinor/fusion-framework-module-ag-grid/legacy-add',
);

/**
 * Map-shaped AG Grid style state, optionally carrying the patched legacy `add()` and the
 * observers it notifies.
 */
export type MapWithAdd = Map<unknown, unknown> & {
  add?: (key: unknown) => Map<unknown, unknown>;
  [legacyAddObservers]?: Set<() => void>;
};
