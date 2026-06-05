import type { IContextProvider } from '@equinor/fusion-framework-module-context';
import type { INavigationProvider } from '@equinor/fusion-framework-module-navigation';
import type { ContextNavigationAdapterInput } from '../adapters/types';

/**
 * Creates a resolver that decodes a context ID from the current URL using
 * the provided adapters and sets it on the context provider.
 *
 * Iterates adapters in priority order — the first static adapter whose
 * `decode()` returns a non-null value wins. Factory adapters are skipped
 * since no app context is available at initial resolution time.
 *
 * @param adapters - Registered adapters, evaluated in order.
 * @param origin - The origin to use when constructing the URL (defaults to `window.location.origin`).
 * @returns An async function compatible with `ContextNavigationConfig.resolveInitialContext`.
 */
export const createResolveContextFromUrl =
  (adapters: ContextNavigationAdapterInput[], origin?: string) =>
  async ({
    context,
    navigation,
  }: {
    context: IContextProvider;
    navigation: INavigationProvider;
  }): Promise<void> => {
    const resolvedOrigin = origin ?? window.location.origin;
    const currentURL = new URL(
      `${navigation.path.pathname}${navigation.path.search ?? ''}`,
      resolvedOrigin,
    );

    for (const entry of adapters) {
      // Factory adapters need app context — skip during initial resolution
      if (typeof entry === 'function') {
        continue;
      }

      const contextId = entry.decode(currentURL);
      if (contextId) {
        try {
          await context.setCurrentContextByIdAsync(contextId);
        } catch (err) {
          console.warn(
            'ContextNavigation: failed to resolve initial context from URL',
            contextId,
            err,
          );
        }
        return;
      }
    }
  };
