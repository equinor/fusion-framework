import type { HistoryStack, Location, LocationState, To } from './types';
import { pathToString, resolvePath } from './utils';

/**
 * Memory-based history stack implementation.
 *
 * Stores navigation state in memory instead of using browser APIs.
 * Unlike BrowserHistoryStack, push/replace only update the current location
 * (history entries are managed by the reducer, not the stack).
 */
export class MemoryHistoryStack implements HistoryStack {
  #current: Location;

  /**
   * Gets the origin of the history stack.
   * Always returns 'memory://' for in-memory storage.
   * @returns The fixed origin used for in-memory URLs.
   */
  get origin(): string {
    return 'memory://';
  }

  /**
   * Gets the current location.
   * @returns The current in-memory navigation location.
   */
  get current(): Location {
    return this.#current;
  }

  /**
   * Creates a memory history stack instance.
   *
   * @param options - Configuration options
   * @param options.initialLocation - Optional initial location (defaults to '/')
   */
  constructor(options?: { initialLocation?: Location }) {
    this.#current = options?.initialLocation ?? {
      pathname: '/',
      search: '',
      hash: '',
      state: null,
      key: '',
      unstable_mask: undefined,
    };
  }

  /**
   * Pushes a new entry onto the history stack.
   *
   * Only updates the current location. History entries are managed by the reducer.
   * @param location - Location to make current.
   */
  push(location: Location): void {
    this.#current = location;
  }

  /**
   * Replaces the current entry in the history stack.
   *
   * Only updates the current location. History entries are managed by the reducer.
   * @param location - Location to make current.
   */
  replace(location: Location): void {
    this.#current = location;
  }

  /**
   * Navigates backward or forward in the history stack.
   *
   * Uses the history state to find the target location by index.
   * Clamps to valid range (first or last entry if out of bounds).
   *
   * @param delta - Number of steps to move (negative for back, positive for forward)
   * @param state - Current location state with history entries
   */
  go(delta: number, state: Readonly<LocationState>): void {
    const { history, current } = state;
    const currentLocation = current.location ?? this.#current;
    // Find current location in history by key
    // Locate the current entry so relative navigation can preserve stack boundaries.
    const currentIndex = history.findIndex((entry) => entry.location.key === currentLocation.key);

    // If current location not found, use last entry
    // Fall back to the newest entry when the stack cannot identify the current location.
    if (currentIndex === -1) {
      // Restore the latest known entry when the history cannot locate the current key.
      if (history.length > 0) {
        this.#current = history[history.length - 1].location;
      }
      return;
    }

    // Calculate target index and clamp to valid range
    const newIndex = currentIndex + delta;
    // Clamp the destination to the available history range.
    if (newIndex < 0) {
      this.#current = state.history[0].location;
      // Use the oldest entry when navigation moves beyond the end of the stack.
    } else if (newIndex >= state.history.length) {
      this.#current = state.history[state.history.length - 1].location;
    } else {
      this.#current = state.history[newIndex].location;
    }
  }

  /**
   * Creates a URL object for a given path.
   *
   * All URLs use the 'memory://' origin since this is in-memory storage.
   * @param to - Target path or partial path object.
   * @returns URL resolved against memory://.
   */
  createURL(to: To): URL {
    const path = resolvePath(to);
    return new URL(pathToString(path), this.origin);
  }
}
