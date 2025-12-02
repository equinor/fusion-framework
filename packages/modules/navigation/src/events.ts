import { FrameworkEvent, type FrameworkEventInit } from '@equinor/fusion-framework-module-event';

import type { INavigationProvider } from './NavigationProvider.interface';
import type { Action, NavigationUpdate, Path } from './lib/types';

/**
 * Event detail for navigation events (before navigation).
 */
export interface NavigateEventDetail {
  /** The target path or location to navigate to */
  location: NavigationUpdate;
  /** Optional current location before navigation */
  currentLocation?: Path;
}

/**
 * Event emitted before navigation occurs.
 * Can be canceled by calling `preventDefault()`.
 */
export class NavigateEvent extends FrameworkEvent<
  FrameworkEventInit<NavigateEventDetail, INavigationProvider>
> {
  constructor(detail: NavigateEventDetail, source: INavigationProvider) {
    super('onNavigate', {
      detail,
      source,
    });
  }
}

/**
 * Event detail for navigated events (after navigation).
 */
export interface NavigatedEventDetail {
  /** The navigation action that occurred (PUSH, POP, REPLACE) */
  action: Action;
  /** The new location after navigation */
  current: NavigationUpdate;
  /** The previous location before navigation */
  previous: NavigationUpdate;
}

/**
 * Event emitted after navigation occurs.
 * Contains the navigation action and location details.
 */
export class NavigatedEvent extends FrameworkEvent<
  FrameworkEventInit<NavigatedEventDetail, INavigationProvider>
> {
  constructor(detail: NavigatedEventDetail, source: INavigationProvider) {
    super('onNavigated', { detail, source });
  }
}

/**
 * Declares navigation events in the FrameworkEventMap for type safety.
 */
declare module '@equinor/fusion-framework-module-event' {
  interface FrameworkEventMap {
    /** Event emitted before navigation occurs, can be canceled to prevent navigation */
    onNavigate: NavigateEvent;
    /** Event emitted after navigation occurs */
    onNavigated: NavigatedEvent;
  }
}
