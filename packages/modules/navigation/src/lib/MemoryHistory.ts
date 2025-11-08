import type { To, LocationState, NavigationUpdate } from './types';
import { pathToString, resolvePath } from './utils';
import { MemoryHistoryStack } from './MemoryStack';
import { BaseHistory } from './BaseHistory';
import { createHistoryReducer, createStore } from './state';

/**
 * Default initial location for memory history.
 */
const defaultInitialLocation: NavigationUpdate = {
  action: 'POP',
  location: { pathname: '/', search: '', hash: '', key: 'unknown' },
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
 * Useful for:
 * - Testing: Control navigation state in tests without browser APIs
 * - SSR: Server-side rendering where window is not available
 * - Widgets: Serving applications as widgets without affecting the main browser history
 * - Node.js environments: Environments without browser APIs
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
