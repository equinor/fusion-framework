import type { Observable } from 'rxjs';
import type { Actions } from './state/history.actions';

/**
 * Navigation action type.
 */
export type Action = 'POP' | 'PUSH' | 'REPLACE';

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
  search?: string;
  hash?: string;
};

/**
 * Location object representing a navigation entry.
 * Extends Path with state and a unique key.
 */
export type Location<T = unknown> = Path & {
  state?: T;
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
 * Options for navigation operations.
 */
export interface NavigateOptions {
  /** Navigation action: 'PUSH' adds to history stack, 'REPLACE' replaces current entry */
  action: Extract<Action, 'PUSH' | 'REPLACE'>;
  /** Optional state to associate with the navigation entry */
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
  readonly action: Action | 'INITIAL';
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
  navigate(to: To, options: NavigateOptions): void;
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
