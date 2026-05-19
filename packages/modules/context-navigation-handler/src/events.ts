import type { FrameworkEventMap, FrameworkEvent, FrameworkEventInit } from '@equinor/fusion-framework-module-event';

import type {
  ContextNavigationHandlerNavigateDetail,
  ContextNavigationHandlerNavigatedDetail,
  ContextNavigationHandlerAdapterResolvedDetail,
  ContextNavigationHandlerSkippedDetail,
} from './types';

import type { ContextNavigationHandlerProvider } from './provider';

declare module '@equinor/fusion-framework-module-event' {
  interface FrameworkEventMap {
    /** Fired before context navigation. Cancelable — call `event.preventDefault()` to block. */
    onContextNavigationHandlerNavigate: FrameworkEvent<
      FrameworkEventInit<ContextNavigationHandlerNavigateDetail, ContextNavigationHandlerProvider>
    >;
    /** Fired after context navigation completes. */
    onContextNavigationHandlerNavigated: FrameworkEvent<
      FrameworkEventInit<ContextNavigationHandlerNavigatedDetail, ContextNavigationHandlerProvider>
    >;
    /** Fired when an adapter is resolved for an app. */
    onContextNavigationHandlerAdapterResolved: FrameworkEvent<
      FrameworkEventInit<ContextNavigationHandlerAdapterResolvedDetail, ContextNavigationHandlerProvider>
    >;
    /** Fired when navigation is skipped. */
    onContextNavigationHandlerSkipped: FrameworkEvent<
      FrameworkEventInit<ContextNavigationHandlerSkippedDetail, ContextNavigationHandlerProvider>
    >;
  }
}
