import type {
  AdapterResolutionContext,
  ContextNavigationAdapter,
  ContextNavigationAdapterInput,
} from '../adapters/types';

/**
 * Iterate registered adapters and return the first one that can handle
 * the given resolution context.
 *
 * - **Object adapters** are tested via `canHandle(ctx)`.
 * - **Factory adapters** are invoked with `ctx`; a non-null return means match.
 *
 * @param ctx - The adapter resolution context (app key, app context, current URL).
 * @param adapters - The registered adapters in evaluation order.
 * @returns The first matching adapter, or `null` if none matched.
 */
export function resolveAdapter(
  ctx: AdapterResolutionContext,
  adapters: readonly ContextNavigationAdapterInput[],
): ContextNavigationAdapter | null {
  // Iterate through adapters in order until one can handle the given context
  for (const entry of adapters) {
    const adapter = typeof entry === 'function' ? entry(ctx) : entry.canHandle(ctx) ? entry : null;
    // Return the first adapter that can handle this context
    if (adapter) return adapter;
  }
  return null;
}
