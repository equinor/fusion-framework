import { FrameworkEvent, type FrameworkEventInit } from '@equinor/fusion-framework-module-event';

import type { INavigationProvider } from './NavigationProvider.interface';
import type { NavigationUpdate, Path } from './lib/types';

/** Event detail for navigation events (before navigation). */
export interface NavigateEventDetail {
  /** The target path or location to navigate to */
  location: NavigationUpdate;
  /** Optional current location before navigation */
  currentLocation?: Path;
}

/**
 * Event emitted before navigation occurs.
 * Can be canceled by calling `preventDefault()` to block the navigation.
 *
 * @example
 * ```ts
 * eventProvider.addEventListener('onNavigate', (event) => {
 *   if (hasUnsavedChanges) {
 *     event.preventDefault();
 *   }
 * });
 * ```
 */
export class NavigateEvent extends FrameworkEvent<
  FrameworkEventInit<NavigateEventDetail, INavigationProvider>
> {
  /** @param detail - Navigation target details. @param source - Provider dispatching the event. */
  constructor(detail: NavigateEventDetail, source: INavigationProvider) {
    super('onNavigate', {
      detail,
      source,
    });
  }
}

/** Declares navigation events in the FrameworkEventMap for type safety. */
declare module '@equinor/fusion-framework-module-event' {
  interface FrameworkEventMap {
    /** Event emitted before navigation occurs, can be canceled to prevent navigation */
    onNavigate: NavigateEvent;
    /** Event emitted after navigation occurs */
    onNavigated: import('./NavigatedEvent').NavigatedEvent;
  }
}
