import { type To, type LocationState, type NavigationUpdate, Action } from './types';
import { pathToString, resolvePath } from './utils';
import { MemoryHistoryStack } from './MemoryStack';
import { BaseHistory } from './BaseHistory';
import { createHistoryReducer, createStore } from './state';

/**
 * Default initial location for memory history.
 */
const defaultInitialLocation: NavigationUpdate = {
  delta: 0,
  action: Action.Pop,
  location: {
    pathname: '/',
    search: '',
    hash: '',
    key: 'unknown',
    state: null,
    unstable_mask: undefined,
  },
};

/**
 * Options for configuring a MemoryHistory instance.
 */
export type MemoryHistoryOptions = {
  /** Optional initial location */
  initialLocation?: NavigationUpdate;
  /** Optional initial history entries */
  initialHistory?: NavigationUpdate[];
};

/**
 * Memory history implementation using in-memory storage.
 *
 * Does not touch browser APIs, making it suitable for:
 * - **Testing** — deterministic navigation state without a DOM
 * - **SSR** — server-side rendering where `window` is unavailable
 * - **Widgets** — embedded apps that must not alter the host page URL
 * - **Node.js** — any environment without browser history APIs
 */
export class MemoryHistory extends BaseHistory {
  public constructor(options?: MemoryHistoryOptions) {
    const { initialLocation, initialHistory } = options ?? {};
    const initial = initialLocation ?? defaultInitialLocation;

    // create initial state for memory history
    const initialState: LocationState = {
      current: initial,
      history: initialHistory ?? [initial],
      blockers: [],
    };

    // create stack for memory history
    const stack = new MemoryHistoryStack({ initialLocation: initialState.current.location });

    // initialize state with stack and reducer
    const state = createStore(
      stack,
      createHistoryReducer(() => initialState, { maxHistory: 100 }),
    );

    super(state);
  }

  /**
   * Creates a URL object for a given path using memory:// origin.
   */
  public createURL(to: To): URL {
    const path = pathToString(resolvePath(to));
    return new URL(path, 'memory://');
  }
}
