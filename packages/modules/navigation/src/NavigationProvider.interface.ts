import type { AgnosticRouteObject, Router } from '@remix-run/router';

import type { History } from './lib/types';
import type { Action, Path, To } from './lib/types';

import type { Observable } from 'rxjs';
import type { IModuleProvider } from '@equinor/fusion-framework-module';

/**
 * Navigation provider interface.
 * Provides routing and navigation capabilities with basename localization.
 */
export interface INavigationProvider extends IModuleProvider {
  /**
   * Observable stream of navigation state updates.
   * Emits localized paths (with basename removed) for consumers.
   */
  readonly state$: Observable<{ action: Action; location: Path }>;

  /**
   * Gets the current localized path (basename removed).
   */
  readonly path: Path;

  /**
   * @deprecated Use `history` instead
   */
  readonly navigator: History;

  /**
   * Gets the history instance.
   */
  readonly history: History;

  /**
   * Creates a router instance from route configuration.
   *
   * @param routes - Route configuration objects compatible with industry-standard routers (Remix/React Router)
   * @returns A configured and initialized router instance
   */
  createRouter(routes: AgnosticRouteObject[]): Router;

  /**
   * Creates a localized href string for navigation.
   *
   * @param to - Optional path or location (defaults to current path)
   */
  createHref(to?: To): string;

  /**
   * Creates a full URL object for navigation.
   *
   * @param to - Optional path or location (defaults to current path)
   */
  createURL(to?: To): URL;

  /**
   * Pushes a new navigation entry onto the history stack.
   *
   * @param to - Path or location to navigate to (relative to basename)
   * @param state - Optional state to associate with the navigation
   */
  push(to: To, state?: unknown): void;

  /**
   * Replaces the current history entry with a new one.
   *
   * @param to - Path or location to navigate to (relative to basename)
   * @param state - Optional state to associate with the navigation
   */
  replace(to: To, state?: unknown): void;
}

