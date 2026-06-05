import type { INavigationProvider } from '@equinor/fusion-framework-module-navigation';

import type {
  AdapterResolutionContext,
  ContextNavigationAdapter,
  ContextNavigationAdapterInput,
} from './adapters/types';

/**
 * Normalize a URL to its path + search representation for comparison.
 *
 * Strips trailing slashes from the pathname so that `/apps/foo/` and
 * `/apps/foo` compare as equal.
 *
 * @param url - The URL to normalize.
 * @returns A string of the form `pathname + search` with trailing slash removed.
 */
export function normalizePath(url: URL): string {
  return `${url.pathname.replace(/\/$/, '') || '/'}${url.search}`;
}

/**
 * Construct the current browser URL from the navigation provider's state.
 *
 * @param navigation - The navigation provider (for reading pathname and search).
 * @param origin - The origin used to construct an absolute URL.
 * @returns An absolute URL representing the current browser location.
 */
export function getCurrentURL(navigation: INavigationProvider, origin: string): URL {
  return new URL(`${navigation.path.pathname}${navigation.path.search ?? ''}`, origin);
}

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
  for (const entry of adapters) {
    const adapter = typeof entry === 'function' ? entry(ctx) : entry.canHandle(ctx) ? entry : null;
    if (adapter) return adapter;
  }
  return null;
}

/**
 * Strip all query parameters from a URL.
 *
 * Used on app switches to give the adapter a clean URL. The adapter's
 * `encode()` will add back whatever params it needs (e.g. `$contextId`
 * for query-strategy apps). On context-only changes within the same app,
 * this function is not called — query params survive naturally.
 *
 * @param url - The URL to strip (mutated in-place).
 */
export function stripQueryParams(url: URL): void {
  url.search = '';
}
