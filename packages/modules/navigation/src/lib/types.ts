import type { Observable } from 'rxjs';
import type { Actions } from './state/history.actions';

/**
 * Actions represent the type of change to a location value.
 */
export enum Action {
  /**
   * A POP indicates a change to an arbitrary index in the history stack, such
   * as a back or forward navigation. It does not describe the direction of the
   * navigation, only that the current index changed.
   *
   * Note: This is the default action for newly created history objects.
   */
  Pop = 'POP',
  /**
   * A PUSH indicates a new entry being added to the history stack, such as when
   * a link is clicked and a new page loads.
   */
  Push = 'PUSH',
  /**
   * A REPLACE indicates the entry at the current index in the history stack
   * being replaced by a new one.
   */
  Replace = 'REPLACE',
}

/**
 * Target path for navigation operations.
 * Can be a string path or a Path object.
 */
export type To = string | Partial<Path>;

/**
 * Path object containing pathname, optional search, and optional hash.
 */
export type Path = {
  pathname: string;
  search: string;
  hash: string;
};

/**
 * Location object representing a navigation entry.
 * Extends Path with state and a unique key.
 */
// biome-ignore lint/suspicious/noExplicitAny: necessary
export type Location<T = any> = Path & {
  state: T;
  key: string;
};

/**
 * Internal state for history management.
 */
export type LocationState = {
  current: NavigationUpdate;
  history: NavigationUpdate[];
  blockers: NavigationBlocker[];
};

/**
 * Callback function for listening to navigation changes.
 */
export type NavigationListener = (update: Readonly<NavigationUpdate>) => void;

/**
 * Navigation update event containing action and location.
 */
export type NavigationUpdate<A extends string = Action, T = unknown> = {
  delta: number;
  action: Readonly<A>;
  location: Readonly<Location<T>>;
};

/**
 * Navigation transition that was blocked.
 * Provides a retry method to allow the navigation to proceed.
 */
export interface NavigationTransition extends NavigationUpdate {
  /**
   * Retries the navigation that was blocked.
   */
  retry(): void;
}

/**
 * Callback function for blocking navigation attempts.
 */
export type NavigationBlocker = (transition: NavigationTransition) => void;

/**
 * Options for controlling navigation behavior.
 *
 * @interface NavigateOptions
 *
 * @property {boolean} [replace] - Determines the navigation action:
 * - `false` (default): Pushes a new entry onto the history stack
 * - `true`: Replaces the current entry in the history stack
 *
 * @property {unknown} [state] - Optional state object to associate with the navigation entry.
 * This state can be accessed later when navigating back to this entry.
 */
export interface NavigateOptions {
  replace?: boolean;
  state?: unknown;
}

/**
 * History interface for managing navigation state.
 * Compatible with industry-standard routers (Remix/React Router) and provides observable state management.
 */
export interface History extends Disposable {
  /** Observable stream of navigation state updates. */
  readonly state$: Observable<NavigationUpdate>;
  /** Observable stream of navigation actions. */
  readonly action$: Observable<Actions>;
  /** Current navigation action. */
  readonly action: Action;
  /** Current location in the history stack. */
  readonly location: Location;

  /** Creates a valid href string for a given path. */
  createHref(to: To): string;
  /** Creates a URL object for a given path. */
  createURL(to: To): URL;
  /** Encodes a location by properly URL-encoding the pathname. */
  encodeLocation(to: To): Path;
  /** Pushes a new navigation entry onto the history stack. */
  push(to: To, state?: unknown): void;
  /** Replaces the current history entry with a new one. */
  replace(to: To, state?: unknown): void;
  /** Navigate to a location with explicit options. */
  navigate(to: To, options?: NavigateOptions): void;
  /** Navigates backward or forward in the history stack. */
  go(delta: number): void;
  /** Sets up a listener for navigation changes. */
  listen(listener: NavigationListener): () => void;
  /** Registers a blocker to intercept navigation attempts. */
  block(blocker: NavigationBlocker): VoidFunction;
}

/**
 * History stack interface for managing navigation entries.
 */
export interface HistoryStack {
  /** Origin URL for the history stack. */
  readonly origin: string;
  /** Current location in the stack. */
  readonly current: Location;
  /** Pushes a new entry onto the history stack. */
  push(location: Location): void;
  /** Replaces the current entry in the history stack. */
  replace(location: Location): void;
  /** Navigates backward or forward in the history stack. */
  go(delta: number, state: Readonly<LocationState>): void;
  /** Creates a URL object for a given path. */
  createURL(to: To): URL;
}
