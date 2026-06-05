import type { FrameworkEvent, FrameworkEventInit } from '@equinor/fusion-framework-module-event';

import type {
  ContextNavigationNavigateDetail,
  ContextNavigationNavigatedDetail,
  ContextNavigationAdapterResolvedDetail,
  ContextNavigationSkippedDetail,
} from './types';

import type { ContextNavigationEventSource } from './plugin';

declare module '@equinor/fusion-framework-module-event' {
  interface FrameworkEventMap {
    /** Fired before context navigation. Cancelable — call `event.preventDefault()` to block. */
    onContextNavigationNavigate: FrameworkEvent<
      FrameworkEventInit<ContextNavigationNavigateDetail, ContextNavigationEventSource>
    >;
    /** Fired after context navigation completes. */
    onContextNavigationNavigated: FrameworkEvent<
      FrameworkEventInit<ContextNavigationNavigatedDetail, ContextNavigationEventSource>
    >;
    /** Fired when an adapter is resolved for an app. */
    onContextNavigationAdapterResolved: FrameworkEvent<
      FrameworkEventInit<ContextNavigationAdapterResolvedDetail, ContextNavigationEventSource>
    >;
    /** Fired when navigation is skipped. */
    onContextNavigationSkipped: FrameworkEvent<
      FrameworkEventInit<ContextNavigationSkippedDetail, ContextNavigationEventSource>
    >;
  }
}
