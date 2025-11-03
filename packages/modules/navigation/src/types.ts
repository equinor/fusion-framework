import type { History } from '@remix-run/router';

/**
 * Type alias for the navigation listener function.
 * This is the callback type used when listening to history changes.
 */
export type NavigationListener = Parameters<History['listen']>[0];

/**
 * Type alias for navigation update events.
 * Represents the state passed to navigation listeners when the location changes.
 * Contains action (PUSH, POP, REPLACE) and location information.
 */
export type NavigationUpdate = Parameters<NavigationListener>[0];
