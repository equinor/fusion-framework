import type { IContextProvider } from '@equinor/fusion-framework-module-context';
import type { INavigationProvider } from '@equinor/fusion-framework-module-navigation';
import type { ContextNavigationAdapter } from '../types';

/**
 * Creates a resolver that decodes a context ID from the current URL using
 * the provided adapters and sets it on the context provider.
 *
 * Iterates adapters in priority order — the first adapter whose `decode()`
 * returns a non-null value wins.
 *
 * @param adapters - Registered adapters, evaluated in order.
 * @returns An async function compatible with `ContextNavigationHandlerConfig.resolveInitialContext`.
 */
export const createResolveContextFromUrl =
  (adapters: ContextNavigationAdapter[]) =>
  async (context: IContextProvider, navigation: INavigationProvider): Promise<void> => {
    const currentURL = new URL(
      `${navigation.path.pathname}${navigation.path.search ?? ''}`,
      window.location.origin,
    );

    for (const adapter of adapters) {
      let contextId: string | null;
      try {
        contextId = adapter.decode(currentURL);
      } catch {
        // Skip adapters that require runtime binding (e.g. custom adapter)
        continue;
      }
      if (contextId) {
        try {
          await context.setCurrentContextByIdAsync(contextId);
        } catch (err) {
          console.warn(
            'ContextNavigationHandler: failed to resolve initial context from URL',
            contextId,
            err,
          );
        }
        return;
      }
    }
  };
