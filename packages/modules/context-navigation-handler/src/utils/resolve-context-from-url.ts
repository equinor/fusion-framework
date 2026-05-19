import type { IContextProvider } from '@equinor/fusion-framework-module-context';
import type { INavigationProvider } from '@equinor/fusion-framework-module-navigation';
import type { ContextNavigationAdapterInput } from '../types';

/**
 * Creates a resolver that decodes a context ID from the current URL using
 * the provided adapters and sets it on the context provider.
 *
 * Iterates adapters in priority order — the first static adapter whose
 * `decode()` returns a non-null value wins. Factory adapters are skipped
 * since no app context is available at initial resolution time.
 *
 * @param adapters - Registered adapters, evaluated in order.
 * @returns An async function compatible with `ContextNavigationHandlerConfig.resolveInitialContext`.
 */
export const createResolveContextFromUrl =
  (adapters: ContextNavigationAdapterInput[]) =>
  async ({
    context,
    navigation,
  }: {
    context: IContextProvider;
    navigation: INavigationProvider;
  }): Promise<void> => {
    const currentURL = new URL(
      `${navigation.path.pathname}${navigation.path.search ?? ''}`,
      window.location.origin,
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
            'ContextNavigationHandler: failed to resolve initial context from URL',
            contextId,
            err,
          );
        }
        return;
      }
    }
  };
