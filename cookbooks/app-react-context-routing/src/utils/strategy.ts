/**
 * Resolves which context-routing strategy the cookbook app should use
 * based on the `?routingStrategy=` query parameter.
 *
 * The cookbook supports four modes so developers can compare behaviour:
 *
 * | `routingStrategy` value | Context id location          |
 * |-------------------------|------------------------------|
 * | `query`                 | `?$contextId=<id>`           |
 * | `path` _(default)_      | `/:contextId/…`              |
 * | `custom`                | `/route-a/:contextId`        |
 * | `none`                  | No framework-managed routing |
 *
 * @module strategy
 */

/** All routing strategies the framework context module understands. */
export type ContextRoutingStrategy = 'query' | 'path' | 'custom';

/** Superset that also includes `'none'` (opt-out / legacy). */
export type ContextMode = ContextRoutingStrategy | 'none';

/** Diagnostic label for how initial context was resolved. */
export type InitSource = 'query' | 'path' | 'custom' | 'parent-or-unknown';

/**
 * Reads `?routingStrategy` from the browser URL and returns the active
 * context mode.
 *
 * Falls back to `'path'` when the parameter is absent or unrecognised.
 *
 * @returns The active context mode for this session
 */
export const resolveContextMode = (): ContextMode => {
  const params = new URLSearchParams(globalThis.location.search);
  const strategy = params.get('routingStrategy');

  if (strategy === 'query') return 'query';
  if (strategy === 'custom') return 'custom';
  if (strategy === 'none') return 'none';
  return 'path';
};

/**
 * Maps the current context mode to a framework-compatible
 * {@link ContextRoutingStrategy} value.
 *
 * `'none'` and `'path'` both resolve to `'path'` because the framework
 * requires a concrete strategy value.
 *
 * @returns The strategy value passed to the context module builder
 */
export const resolveRoutingStrategy = (): ContextRoutingStrategy => {
  const mode = resolveContextMode();
  return mode === 'query' || mode === 'custom' ? 'path' : 'path';
};

/**
 * Reads `?routingStrategy` and returns a display-friendly label.
 *
 * Unlike {@link resolveContextMode}, this function defaults to `'none'`
 * when the parameter is absent, which better reflects that no explicit
 * strategy was selected by the developer.
 *
 * @returns The label shown in the diagnostics panel
 */
export const resolveStrategyLabel = (): ContextMode => {
  const params = new URLSearchParams(globalThis.location.search);
  const strategy = params.get('routingStrategy');

  if (strategy === 'query') return 'query';
  if (strategy === 'path') return 'path';
  if (strategy === 'custom') return 'custom';
  return 'none';
};
