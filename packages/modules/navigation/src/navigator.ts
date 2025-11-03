import type { History, To, Path, Location } from '@remix-run/router';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';

import type { NavigationUpdate, NavigationListener } from './types';

/**
 * Interface representing a navigator that extends both an observable of navigation updates and the History interface.
 */
export interface INavigator<T extends NavigationUpdate = NavigationUpdate>
  extends Observable<T>,
    History {
  readonly basename?: string;
  readonly origin?: string;
  readonly value: NavigationUpdate;
  readonly location: NavigationUpdate['location'];
  dispose: VoidFunction;
  listen(listener: NavigationListener): VoidFunction;
}

/**
 * Type guard to check if a given 'to' parameter is a Location object.
 * @param to - The object to check.
 * @returns True if 'to' is a Location object, false otherwise.
 */
const isLocation = (to: To): to is Location => typeof to === 'object' && 'key' in to;

/**
 * Class representing a navigator that manages navigation and history state.
 */
export class Navigator<T extends NavigationUpdate = NavigationUpdate>
  extends Observable<T>
  implements INavigator<T>
{
  #history: History;
  #baseName?: string;
  #origin?: string = window.location.origin;
  #subscriptions = new Subscription();
  #state: BehaviorSubject<T>;

  #logger: typeof console;

  /**
   * Gets the basename of the navigator.
   */
  get basename(): string | undefined {
    return this.#baseName;
  }

  /**
   * Gets the origin of the navigator.
   */
  get origin(): string | undefined {
    return this.#origin;
  }

  /**
   * Gets the current navigation state as an observable.
   */
  get state(): Observable<T> {
    return this.#state.asObservable();
  }

  /**
   * Gets the current navigation state value.
   */
  get value(): T {
    return this.#state.value;
  }

  /**
   * Gets the current location from the navigation state.
   */
  get location(): T['location'] {
    return this.value.location;
  }

  /**
   * Gets the current action from the navigation state.
   */
  get action(): T['action'] {
    return this.value.action;
  }

  /**
   * Creates a new Navigator instance.
   * Wraps a history instance and makes it observable, allowing reactive navigation updates.
   *
   * @param args - Configuration options:
   *   - `basename`: Optional base pathname for the application
   *   - `history`: Required history instance from @remix-run/router
   *   - `logger`: Optional logger (defaults to console)
   *   - `mode`: Optional mode ('MASTER' | 'SLAVE') - currently unused but reserved for future use
   */
  constructor(args: {
    basename?: string;
    history: History;
    // biome-ignore lint/suspicious/noExplicitAny: logger can be any console-like object
    logger?: any;
    mode?: 'MASTER' | 'SLAVE';
  }) {
    // Observable subscription: when someone subscribes, subscribe to internal state
    super((subscriber) => this.#state.subscribe(subscriber));
    const { basename, history } = args;
    this.#logger = args.logger || console;
    this.#baseName = basename;
    this.#history = history;

    // Initialize state with current history state (action and location)
    // Delta is set to null initially as it's only set during navigation transitions
    this.#state = new BehaviorSubject<T>({
      action: this.#history.action,
      location: this.#history.location,
      delta: null,
    } as T);

    // Subscribe to history changes and forward them to our observable state
    // This keeps Navigator in sync with the underlying history instance
    this.#subscriptions.add(
      this.#history.listen((update) => {
        // IMPORTANT: Prevent duplicate state updates by checking location key
        // Location keys are unique identifiers for each navigation event
        // This prevents unnecessary state emissions when the same location is visited
        if (update.location.key !== this.#state.value.location.key) {
          this.#state.next(update as T);
        }
      }),
    );
  }

  /**
   * Encodes a location into a path string.
   * @param to - The location to encode.
   * @returns The encoded path string.
   */
  public encodeLocation(to: To): Path {
    return this.#history.encodeLocation(to);
  }

  /**
   * Subscribes to navigation updates.
   * @param listener - The listener function to receive updates.
   * @returns A function to unsubscribe the listener.
   */
  public listen(listener: NavigationListener): VoidFunction {
    const subscription = this.#state.subscribe(listener);
    this.#logger.debug('Navigator::listen', listener);
    return () => {
      this.#logger.debug('Navigator::listen[unsubscribe]', listener);
      return subscription.unsubscribe();
    };
  }

  /**
   * Creates a URL string for a given location.
   * @param to - The location to create a URL for.
   * @returns The created URL string.
   */
  public createHref(to: To): string {
    return this.#history.createHref(to);
  }

  /**
   * Navigates to a specific history entry by its relative position to the current entry.
   * @param delta - The relative position to move in the history stack.
   */
  public go(delta: number): void {
    this.#history.go(delta);
  }

  /**
   * Pushes a new entry onto the history stack.
   * Navigates to a new location and adds it to the browser history.
   *
   * @param to - The location or URL to navigate to
   * @param state - Optional state to associate with the navigation entry
   *
   * @remarks
   * This method prevents duplicate navigations by checking if the target location
   * is the same as the current location before pushing.
   */
  public push(to: To, state?: unknown): void {
    // Skip navigation if it's a duplicate of the current location
    // This prevents unnecessary history stack entries and state updates
    const skip = isLocation(to) && this._isDuplicateLocation(to);
    if (!skip) {
      this.#history.push(to, state);
    }
  }

  /**
   * Replaces the current history entry with a new one.
   * Navigates to a new location without adding to the browser history stack.
   *
   * @param to - The location or URL to navigate to
   * @param state - Optional state to associate with the navigation entry
   *
   * @remarks
   * Unlike push(), replace() doesn't create a new history entry, so the back button
   * won't return to the previous location. Useful for redirects or form submissions.
   */
  public replace(to: To, state?: unknown): void {
    // Skip replacement if it's a duplicate of the current location
    const skip = isLocation(to) && this._isDuplicateLocation(to);
    if (!skip) {
      this.#history.replace(to, state);
    }
  }

  /**
   * Creates a full URL for a given location.
   * @param to - The location to create a URL for.
   * @returns The created URL object.
   */
  public createURL(to: To): URL {
    return this.#history.createURL(to);
  }

  /**
   * Checks if a given location is a duplicate of the current location.
   * Uses location keys for comparison, which are unique identifiers for each navigation event.
   *
   * @param location - The location to check
   * @returns True if the location is a duplicate, false otherwise
   *
   * @remarks
   * Currently uses location.key for comparison. In the future, this might be enhanced
   * to also check for URL changes (pathname, search, hash) to catch cases where the
   * same location key might represent different URLs.
   */
  protected _isDuplicateLocation(location: Location) {
    // NOTE: Location keys are unique per navigation event, so identical keys indicate duplicates
    // TODO: Consider also checking pathname, search, and hash for more robust duplicate detection
    return location.key === this.#state.value.location.key;
  }

  /**
   * Disposes of the navigator by unsubscribing from all subscriptions.
   */
  dispose() {
    this.#subscriptions.unsubscribe();
  }
}
