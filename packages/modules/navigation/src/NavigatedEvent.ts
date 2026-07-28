import { FrameworkEvent, type FrameworkEventInit } from '@equinor/fusion-framework-module-event';

import type { INavigationProvider } from './NavigationProvider.interface';
import type { Action, NavigationUpdate } from './lib/types';

/** Event detail for navigated events (after navigation). */
export interface NavigatedEventDetail {
  /** The navigation action that occurred (PUSH, POP, REPLACE) */
  action: Action;
  /** The new location after navigation */
  current: NavigationUpdate;
  /** The previous location before navigation */
  previous: NavigationUpdate;
}

/**
 * Event emitted after navigation completes.
 * Contains the navigation action type and both current and previous locations.
 *
 * @example
 * ```ts
 * eventProvider.addEventListener('onNavigated', (event) => {
 *   const { action, current, previous } = event.detail;
 *   console.log(`${action}: ${previous.location.pathname} -> ${current.location.pathname}`);
 * });
 * ```
 */
export class NavigatedEvent extends FrameworkEvent<
  FrameworkEventInit<NavigatedEventDetail, INavigationProvider>
> {
  /** @param detail - Completed navigation details. @param source - Provider dispatching the event. */
  constructor(detail: NavigatedEventDetail, source: INavigationProvider) {
    super('onNavigated', { detail, source });
  }
}
