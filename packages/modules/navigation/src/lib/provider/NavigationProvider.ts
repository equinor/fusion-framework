import { type AgnosticRouteObject, createRouter, type Path, type To } from '@remix-run/router';

import { filter, map } from 'rxjs/operators';

import {
  BaseModuleProvider,
  type BaseModuleProviderCtorArgs,
} from '@equinor/fusion-framework-module/provider';

import type { INavigationProvider } from './INavigationProvider';

import type { INavigationConfigurator } from '../../configurator';
import { Navigator, type INavigator } from '../../navigator';

/**
 * Normalizes a pathname by collapsing multiple consecutive slashes into a single slash.
 * Example: "/app//users///profile" becomes "/app/users/profile"
 *
 * @param path - The pathname to normalize
 * @returns The normalized pathname
 */
const normalizePathname = (path: string) => path.replace(/\/+/g, '/');

/**
 * Navigation provider implementation.
 * Manages routing and navigation state with basename localization.
 *
 * @remarks
 * This provider:
 * - Wraps the Navigator to provide observable navigation state
 * - Localizes paths by removing basename prefix
 * - Creates React Router 7 compatible routers
 * - Handles navigation actions (push, replace, createHref, etc.)
 *
 * Path localization ensures that consumers receive paths relative to the basename,
 * while internally we work with full paths including basename.
 */
export class NavigationProvider
  extends BaseModuleProvider<INavigationConfigurator>
  implements INavigationProvider
{
  #navigator: INavigator;
  #basePathname?: string;

  /**
   * Observable stream of navigation state updates.
   * Emits localized paths (with basename removed) for consumers.
   *
   * @returns Observable stream of navigation updates with localized paths
   *
   * @remarks
   * The observable pipeline:
   * 1. Filters events to only include paths within the basename scope
   * 2. Maps paths to localized versions (basename removed)
   * 3. Emits { action, location } where location.pathname is relative to basename
   */
  public get state$() {
    return this.#navigator.pipe(
      // Only emit navigation events for paths that start with the basename
      // This ensures we only process navigation within our application scope
      filter((event) =>
        this.#basePathname ? event.location.pathname.startsWith(this.#basePathname) : true,
      ),
      // Transform paths to localized versions (remove basename prefix)
      // Consumers receive clean paths like "/users" instead of "/app/users"
      map(({ action, location }) => ({
        action,
        location: this._localizePath(location),
      })),
    );
  }

  /**
   * Gets the underlying navigator instance.
   * Provides direct access to the navigator for advanced use cases.
   *
   * @returns The navigator instance
   */
  public get navigator(): INavigator {
    return this.#navigator;
  }

  /**
   * Gets the current localized path (basename removed).
   * Returns the path relative to the application basename.
   *
   * @returns The current path with basename prefix removed
   */
  public get path(): Path {
    return this._localizePath(this.navigator.location);
  }

  /**
   * Creates a new NavigationProvider instance.
   *
   * @param args - Configuration arguments containing module config
   * @throws {Error} If no history is provided in the configuration
   */
  constructor(args: BaseModuleProviderCtorArgs<INavigationConfigurator>) {
    super(args);

    const { basename, history } = args.config;

    this.#basePathname = basename;

    // History is required - we cannot create a navigation provider without it
    if (!history) {
      throw Error('no history provided!');
    }

    // Wrap the history instance in a Navigator to make it observable
    this.#navigator = new Navigator({
      basename,
      history,
    });

    // Ensure proper cleanup when the provider is disposed
    this._addTeardown(() => this.#navigator.dispose());
  }

  /**
   * Creates a React Router 7 router instance from route configuration.
   *
   * @param routes - Route configuration objects compatible with React Router 7
   * @returns A configured and initialized router instance
   *
   * @remarks
   * This creates a router using React Router 7's `createRouter` API with:
   * - Basename from the navigator
   * - History instance from the navigator
   * - Router 7 future flag `v7_prependBasename` enabled for proper basename handling
   *
   * The router is initialized before being returned, so it's ready to use immediately.
   */
  public createRouter(routes: AgnosticRouteObject[]) {
    const history = this.#navigator;
    console.debug('NavigationProvider::createRouter', routes);
    const router = createRouter({
      basename: history.basename,
      history,
      routes,
      // Enable Router 7's basename prepending behavior
      // This ensures basename is properly handled in route matching and navigation
      future: {
        v7_prependBasename: true,
      },
    });
    router.initialize();
    return router;
  }

  /**
   * Creates a localized href string for navigation.
   * Adds basename prefix to the provided path.
   *
   * @param to - Optional path or location (defaults to current path)
   * @returns A full href string including basename
   */
  public createHref(to?: To): string {
    return this.#navigator.createHref(this._createToPath(to ?? this.path));
  }

  /**
   * Creates a full URL object for navigation.
   * Adds basename prefix to the provided path.
   *
   * @param to - Optional path or location (defaults to current path)
   * @returns A URL object with full path including basename
   */
  public createURL(to?: To): URL {
    return this.#navigator.createURL(this._createToPath(to ?? this.path));
  }

  /**
   * Pushes a new navigation entry onto the history stack.
   * Adds basename prefix to the provided path before navigation.
   *
   * @param to - Path or location to navigate to (relative to basename)
   * @param state - Optional state to associate with the navigation
   */
  public push(to: To, state?: unknown): void {
    this.#navigator.push(this._createToPath(to ?? this.path), state);
  }

  /**
   * Replaces the current history entry with a new one.
   * Adds basename prefix to the provided path before navigation.
   *
   * @param to - Path or location to navigate to (relative to basename)
   * @param state - Optional state to associate with the navigation
   */
  public replace(to: To, state?: unknown): void {
    this.#navigator.replace(this._createToPath(to ?? this.path), state);
  }

  /**
   * Localizes a path by removing the basename prefix.
   * Converts full paths like "/app/users" to localized paths like "/users".
   *
   * @param location - The path location to localize
   * @returns A new Path object with basename prefix removed
   *
   * @remarks
   * This method:
   * 1. Removes the basename prefix from pathname using string replacement
   * 2. Normalizes the resulting pathname (removes duplicate slashes)
   * 3. Preserves search params and hash
   *
   * TODO: Consider more robust basename removal that handles edge cases
   * (e.g., when pathname doesn't start with basename, or partial matches)
   */
  protected _localizePath(location: Path): Path {
    const { pathname, search, hash } = location;
    return {
      // Remove basename prefix and normalize the path
      // Note: Simple string replace works but could be improved for edge cases
      pathname: normalizePathname(pathname.replace(this.#basePathname ?? '', '')),
      search,
      hash,
    };
  }

  /**
   * Creates a full path object from a target location, adding basename prefix.
   * Converts localized paths like "/users" to full paths like "/app/users".
   *
   * @param to - Path string or location object (relative to basename)
   * @returns A Path object with basename prefix added
   *
   * @remarks
   * This method:
   * 1. Normalizes string input to pathname-only object
   * 2. Handles root path ("/") specially (doesn't add another slash)
   * 3. Joins basename and pathname, filtering out undefined/empty parts
   * 4. Normalizes the resulting pathname
   * 5. Preserves search params and hash from the input
   */
  protected _createToPath(to: To): Partial<Path> {
    // Normalize input: convert string to pathname object if needed
    const { pathname, search, hash } =
      typeof to === 'string' ? { pathname: to, search: undefined, hash: undefined } : to;
    return {
      // Build full pathname by joining basename and pathname
      // Filter out root path ("/") and undefined values to avoid double slashes
      // Example: basename="/app", pathname="/users" -> "/app/users"
      // Example: basename="/app", pathname="/" -> "/app"
      pathname: normalizePathname(
        [this.#basePathname, pathname === '/' ? undefined : pathname].filter((x) => !!x).join('/'),
      ),
      search,
      hash,
    };
  }
}
