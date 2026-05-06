import type { FrameworkEvent, FrameworkEventInit } from '@equinor/fusion-framework-module-event';

import type {
  ContextNavigationHandlerNavigateDetail,
  ContextNavigationHandlerNavigatedDetail,
  ContextNavigationHandlerStrategyResolvedDetail,
  ContextNavigationHandlerSkippedDetail,
} from './types';
import type { ContextNavigationHandlerProvider } from './provider';

/**
 * Augment the framework event map with context-navigation-handler events.
 *
 * This enables type-safe `addEventListener` and `dispatchEvent` calls
 * for all events emitted by this module.
 */
declare module '@equinor/fusion-framework-module-event' {
  interface FrameworkEventMap {
    /**
     * Dispatched **before** the reconciler navigates.
     * Cancelable — call `event.preventDefault()` to abort navigation.
     */
    onContextNavigationHandlerNavigate: FrameworkEvent<
      FrameworkEventInit<ContextNavigationHandlerNavigateDetail, ContextNavigationHandlerProvider>
    >;

    /**
     * Dispatched **after** navigation completes.
     */
    onContextNavigationHandlerNavigated: FrameworkEvent<
      FrameworkEventInit<ContextNavigationHandlerNavigatedDetail, ContextNavigationHandlerProvider>
    >;

    /**
     * Dispatched when a routing strategy is resolved for an app.
     */
    onContextNavigationHandlerStrategyResolved: FrameworkEvent<
      FrameworkEventInit<
        ContextNavigationHandlerStrategyResolvedDetail,
        ContextNavigationHandlerProvider
      >
    >;

    /**
     * Dispatched when reconciliation is skipped.
     */
    onContextNavigationHandlerSkipped: FrameworkEvent<
      FrameworkEventInit<ContextNavigationHandlerSkippedDetail, ContextNavigationHandlerProvider>
    >;
  }
}
