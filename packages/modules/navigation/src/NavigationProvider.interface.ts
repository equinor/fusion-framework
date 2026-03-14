// TODO: Remove @remix-run/router dependency once all apps have migrated to @equinor/fusion-framework-react-router
import type { AgnosticRouteObject, Router } from '@remix-run/router';

import type { History, NavigateOptions } from './lib/types';
import type { Action, Path, To } from './lib/types';

import type { Observable } from 'rxjs';
import type { IModuleProvider } from '@equinor/fusion-framework-module';

/**
 * Navigation provider interface.
 *
 * Provides routing and navigation capabilities with automatic basename
 * localization. Consumers work with clean paths (e.g. `/users`) while the
 * underlying history operates on full paths (e.g. `/apps/my-app/users`).
 *
 * @example
 * ```ts
 * const nav: INavigationProvider = framework.modules.navigation;
 * nav.push('/users');
 * console.log(nav.path.pathname); // '/users'
 * ```
 */
export interface INavigationProvider extends IModuleProvider {
  /**
   * Observable stream of navigation state updates.
   * Emits localized paths (with basename removed) for consumers.
   */
  readonly state$: Observable<{ action: Action; location: Path }>;

  /**
   * Gets the basename.
   */
  readonly basename: string;

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
   * @deprecated Use `@equinor/fusion-framework-react-router` instead.
   * @param routes - Route configuration objects compatible with Remix/React Router
   * @returns A configured and initialized {@link Router} instance with basename applied
   */
  createRouter(routes: AgnosticRouteObject[]): Router;

  /**
   * Creates a localized href string including the basename prefix.
   *
   * @param to - Path or location to resolve (defaults to current path)
   * @returns Fully-qualified href string with basename included
   */
  createHref(to?: To): string;

  /**
   * Creates a full {@link URL} object including the basename prefix.
   *
   * @param to - Path or location to resolve (defaults to current path)
   * @returns A {@link URL} instance representing the resolved navigation target
   */
  createURL(to?: To): URL;

  /**
   * Navigates to a location with explicit options.
   *
   * @param to - Optional path or location (defaults to current path)
   * @param options - Optional navigation options
   */
  navigate(to?: To, options?: Partial<NavigateOptions>): void;

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
