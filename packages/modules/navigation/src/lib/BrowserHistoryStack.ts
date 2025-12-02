import { pathToString, resolvePath, resolveWindowLocation } from './utils';
import type { HistoryStack, Location, To } from './types';

/**
 * Browser history stack implementation using native browser APIs.
 *
 * Manages navigation state using the browser's History API (pushState/replaceState).
 * Stores location state in history.state and uses relative paths for navigation.
 * This is the base implementation for regular (non-hash) routing.
 *
 * @example
 * ```ts
 * const stack = new BrowserHistoryStack(window);
 * stack.push({ pathname: '/users', key: 'abc123', state: { userId: 1 } });
 * // Updates URL to /users and adds entry to history
 * ```
 */
export class BrowserHistoryStack implements HistoryStack {
  /**
   * @param _window - The window object to use for history operations
   */
  public constructor(protected readonly _window: Window) {}

  /**
   * Gets the origin of the history stack.
   */
  public get origin(): string {
    return this._window.location.origin;
  }

  /**
   * Gets the current location.
   */
  public get current(): Location {
    return resolveWindowLocation(this._window);
  }

  /**
   * Pushes a new entry onto the history stack.
   */
  public push(location: Location): void {
    this.navigate(location, 'PUSH');
  }

  /**
   * Replaces the current entry in the history stack.
   */
  public replace(location: Location): void {
    this.navigate(location, 'REPLACE');
  }

  /**
   * Navigates to a location with the specified action.
   */
  public navigate(location: Location, action: 'PUSH' | 'REPLACE'): void {
    const relativePath = this._createRelativePath(location);
    const state = { value: location.state, key: location.key };
    if (action === 'PUSH') {
      this._window.history.pushState(state, '', relativePath);
    } else {
      this._window.history.replaceState(state, '', relativePath);
    }
  }

  /**
   * Navigates backward or forward in the history stack.
   */
  public go(delta: number): void {
    this._window.history.go(delta);
  }

  /**
   * Creates a URL object for a given path.
   */
  public createURL(to: To): URL {
    return new URL(pathToString(resolvePath(to)), this.origin);
  }

  protected _createRelativePath(to: To): string {
    return pathToString(this.createURL(to));
  }
}
