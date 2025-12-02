// TODO: Remove @remix-run/router dependency once all apps have migrated to @equinor/fusion-framework-react-router
import { type AgnosticRouteObject, createRouter } from '@remix-run/router';
import type { Observable } from 'rxjs';
import { filter, pairwise, shareReplay } from 'rxjs/operators';

import {
  BaseModuleProvider,
  type BaseModuleProviderCtorArgs,
} from '@equinor/fusion-framework-module/provider';

import type { INavigationProvider } from './NavigationProvider.interface';
import type { INavigationConfigurator } from './NavigationConfigurator.interface';
import type { History, NavigateOptions, NavigationUpdate, Path, To } from './lib/types';
import {
  TelemetryLevel,
  TelemetryScope,
  type ITelemetryProvider,
} from '@equinor/fusion-framework-module-telemetry';
import type { IEventModuleProvider } from '@equinor/fusion-framework-module-event';
import { NavigatedEvent } from './events';
import { pathToString } from './lib/utils';
import type { BaseHistory } from './lib';

/**
 * Normalizes a pathname by:
 * - Collapsing multiple consecutive slashes into a single slash
 * - Removing trailing slashes
 *
 * @example
 * normalizePathname("/app//users///profile/") // returns "/app/users/profile"
 * normalizePathname("///multiple///slashes///") // returns "/multiple/slashes"
 *
 * @param path - The pathname to normalize
 * @returns The normalized pathname without consecutive or trailing slashes
 */
const normalizePathname = (path: string) => path.replace(/\/+/g, '/').replace(/\/$/, '');

/**
 * Navigation provider implementation.
 * Manages routing and navigation state with basename localization.
 *
 * @remarks
 * This provider:
 * - Wraps the Navigator to provide observable navigation state
 * - Localizes paths by removing basename prefix
 * - Creates routers compatible with industry-standard routers (Remix/React Router)
 * - Handles navigation actions (push, replace, createHref, etc.)
 *
 * Path localization ensures that consumers receive paths relative to the basename,
 * while internally we work with full paths including basename.
 */
export class NavigationProvider
  extends BaseModuleProvider<INavigationConfigurator>
  implements INavigationProvider
{
  #history: History;
  #basename?: string;
  #state$: Observable<NavigationUpdate>;

  #telemetry?: ITelemetryProvider;
  #event?: IEventModuleProvider;

  /**
   * Observable stream of navigation state updates.
   * Emits localized paths (with basename removed) for consumers.
   */
  public get state$(): Observable<NavigationUpdate> {
    return this.#state$;
  }

  /**
   * Gets the basename.
   */
  public get basename(): string {
    return this.#basename ?? '';
  }

  /**
   * @deprecated Use `history` instead
   */
  public get navigator(): History {
    this.#telemetry?.trackException({
      name: 'Navigation::navigator.deprecated',
      exception: new Error('navigator is deprecated, use history instead'),
      level: TelemetryLevel.Warning,
      scope: ['navigation', TelemetryScope.Framework],
    });
    return this.#history;
  }

  /**
   * Gets the history instance.
   */
  public get history(): History {
    return this.#history;
  }

  /**
   * Gets the current localized path (basename removed).
   */
  public get path(): Path {
    return this._localizePath(this.#history.location);
  }

  /**
   * @param args - Configuration arguments containing module config
   * @throws {Error} If no history is provided in the configuration
   */
  constructor(args: BaseModuleProviderCtorArgs<INavigationConfigurator>) {
    super(args);

    // Extract configuration values
    const { basename, history, telemetry, eventProvider } = args.config;

    this.#basename = basename;
    this.#event = eventProvider;
    this.#telemetry = telemetry;

    // History is required - validate and track error if missing
    if (!history) {
      this.#telemetry?.trackException({
        name: 'Navigation::history.required',
        exception: new Error('no history provided!'),
        level: TelemetryLevel.Error,
        scope: ['navigation', TelemetryScope.Application],
      });
      throw Error('no history provided!');
    }

    this.#history = history;

    // Create state$ observable that filters for paths within basename scope
    // shareReplay ensures subscribers get the latest value and share the subscription
    this.#state$ = this.#history.state$.pipe(
      filter((update: NavigationUpdate) => this._isWithinBasenameScope(update.location.pathname)),
      shareReplay({ bufferSize: 1, refCount: true }),
    );

    this._initialize();
  }

  /**
   * Sets up navigation subscriptions for events and telemetry.
   *
   * Configures subscriptions for:
   * - NavigatedEvent dispatching when navigation changes
   * - Telemetry tracking for navigation actions and events
   * - History disposal cleanup
   */
  protected _initialize(): void {
    // Dispatch NavigatedEvent and track telemetry when navigation changes
    // pairwise() gives us [previous, current] pairs to compare navigation state
    this._addTeardown(
      this.#state$.pipe(pairwise()).subscribe(([previous, current]) => {
        // emit NavigatedEvent for other modules to listen to when navigation changes
        this.#event?.dispatchEvent(
          new NavigatedEvent(
            {
              action: current.action,
              current,
              previous,
            },
            this,
          ),
        );
        // track telemetry for navigation changes
        this.#telemetry?.trackEvent({
          name: 'Navigation::navigated',
          level: TelemetryLevel.Information,
          scope: ['navigation', TelemetryScope.Application],
          properties: {
            action: current.action,
            location: pathToString(current.location),
            previousLocation: pathToString(previous.location),
          },
        });
      }),
    );

    // Track all navigation actions for debugging (if telemetry is enabled)
    if (this.#telemetry) {
      this._addTeardown(
        this.#history.action$.subscribe((action) => {
          this.#telemetry?.trackEvent({
            name: `Navigation::action:${action.type}`,
            level: TelemetryLevel.Debug,
            scope: ['navigation', TelemetryScope.Framework],
            properties: {
              type: action.type,
              action: action,
            },
          });
        }),
      );
    }

    // Clean up history instance when provider is disposed
    this._addTeardown(() => this.#history[Symbol.dispose]());
  }

  /**
   * Creates a router instance from route configuration.
   *
   * @deprecated Use `@equinor/fusion-framework-react-router` instead
   *
   * @param routes - Route configuration objects compatible with industry-standard routers (Remix/React Router)
   * @returns A configured and initialized router instance
   */
  public createRouter(routes: AgnosticRouteObject[]) {
    this.#telemetry?.trackEvent({
      name: 'Navigation::createRouter',
      level: TelemetryLevel.Warning,
      scope: ['navigation', 'deprecated', TelemetryScope.Application],
    });
    const router = createRouter({
      basename: this.#basename,
      history: this.#history as unknown as import('@remix-run/router').History,
      routes,
      future: {
        v7_prependBasename: true,
      },
    });
    router.initialize();
    return router;
  }

  /**
   * Creates a localized href string for navigation.
   *
   * @param to - Optional path or location (defaults to current path)
   */
  public createHref(to?: To): string {
    return this.#history.createHref(this._createToPath(to ?? this.path));
  }

  /**
   * Creates a full URL object for navigation.
   *
   * @param to - Optional path or location (defaults to current path)
   */
  public createURL(to?: To): URL {
    return this.#history.createURL(this._createToPath(to ?? this.path));
  }

  /**
   * Pushes a new navigation entry onto the history stack.
   *
   * @param to - Path or location to navigate to (relative to basename)
   * @param state - Optional state to associate with the navigation
   */
  public push(to: To, state?: unknown): void {
    this.navigate(to, { state });
  }

  /**
   * Replaces the current history entry with a new one.
   *
   * @param to - Path or location to navigate to (relative to basename)
   * @param state - Optional state to associate with the navigation
   */
  public replace(to: To, state?: unknown): void {
    this.navigate(to, { replace: true, state });
  }

  /**
   * Navigate to a location with explicit options.
   *
   * @param to - Optional path or location (defaults to current path)
   * @param options - Optional navigation options
   */
  public navigate(to?: To, options?: Partial<NavigateOptions>): void {
    const { replace = false, state } = options ?? {};
    this.#history.navigate(this._createToPath(to ?? this.path), { replace, state });
    // we need to pop the history to update the notify history listeners
    // Frameworks as react router have their internal state management,
    // so we need to force a pop to notify the framework that the history has changed
    (this.#history as BaseHistory).pop();
  }
  /**
   * Checks if a pathname is within the basename scope.
   */
  protected _isWithinBasenameScope(pathname: string): boolean {
    return this.#basename ? pathname.startsWith(this.#basename) : true;
  }

  /**
   * Localizes a path by removing the basename prefix.
   */
  protected _localizePath(location: Path): Path {
    const { pathname, search, hash } = location;
    return {
      pathname: normalizePathname(pathname.replace(this.#basename ?? '', '')),
      search,
      hash,
    };
  }

  /**
   * Creates a full path object from a target location, adding basename prefix.
   */
  protected _createToPath(to: To): Partial<Path> {
    // Parse the 'to' parameter into path components
    const pathComponents = typeof to === 'string' ? { pathname: to } : to;

    // Extract path parts, defaulting to current path values
    const rawPathname = pathComponents.pathname ?? this.path.pathname;
    const pathname = normalizePathname(`${this.#basename ?? ''}/${rawPathname}`);
    const search = pathComponents.search ?? this.path.search;
    const hash = pathComponents.hash ?? this.path.hash;

    return { pathname, search, hash };
  }
}
