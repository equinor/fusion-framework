import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

import type { Actions, HistoryState } from './state';

import type {
  NavigateOptions,
  NavigationListener,
  NavigationUpdate,
  Path,
  To,
  History,
  NavigationBlocker,
} from './types';

/**
 * Abstract base class for history implementations.
 * Provides common state management and navigation logic that can be shared
 * across different history implementations (browser, memory, etc.).
 */
export abstract class BaseHistory implements History {
  // Subscriptions for cleanup
  #teardowns = new Subscription();

  // internal state
  #state: HistoryState;

  /**
   * Gets the current location.
   */
  public get location(): History['location'] {
    return this.#state.subject.value.current.location;
  }

  /**
   * Gets the current action.
   */
  public get action(): History['action'] {
    return this.#state.subject.value.current.action;
  }

  /**
   * Observable stream of navigation state changes.
   * Emits on all navigation events (push, replace, pop).
   */
  public get state$(): History['state$'] {
    return this.#state.subject.select((state) => state.current);
  }

  /**
   * Observable stream of navigation actions.
   */
  public get action$(): History['action$'] {
    return this.#state.subject.action$;
  }

  /**
   * Checks if there are any active navigation blockers.
   */
  public get hasBlockers(): boolean {
    return this.#state.subject.value.blockers.length > 0;
  }

  protected constructor(state: HistoryState) {
    this.#state = state;
  }

  /**
   * Creates a valid href string for a given path.
   */
  public createHref(to: To): string {
    return this.createURL(to).href;
  }

  /**
   * Creates a URL object for a given path.
   */
  public createURL(to: To): URL {
    return this.#state.stack.createURL(to);
  }

  /**
   * Encodes a location by properly URL-encoding the pathname.
   */
  public encodeLocation(to: To): Path {
    return this.#state.stack.createURL(to);
  }

  /**
   * Navigate to a location with explicit options.
   *
   * @param to - The target path (string, Path object, or Location object)
   * @param options - Navigation options specifying action (PUSH/REPLACE) and optional state
   */
  public navigate(to: To, options: NavigateOptions): void {
    const action = this.#state.actions.navigate(to, options);
    this.#state.subject.next(action);
  }

  /**
   * Pushes a new location onto the history stack.
   */
  public push(to: To, state?: unknown): void {
    this.navigate(to, { action: 'PUSH', state });
  }

  /**
   * Replaces the current location in the history stack.
   */
  public replace(to: To, state?: unknown): void {
    this.navigate(to, { action: 'REPLACE', state });
  }

  /**
   * Navigates backward or forward in the history stack.
   *
   * @param delta - The number of steps to move (negative for backward, positive for forward)
   */
  public go(delta: number): void {
    const action = this.#state.actions.go(delta);
    this.#state.subject.next(action);
  }

  /**
   * Sets up a listener for navigation changes.
   *
   * Only listens for POP actions (browser back/forward navigation). PUSH/REPLACE
   * actions are programmatic and synchronous - the caller already knows about them.
   * POP actions come from browser events and are asynchronous, so we need to listen.
   * This matches industry-standard router behavior (Remix/React Router).
   *
   * @param listener - Function to call on navigation changes
   * @returns Function to unsubscribe the listener
   */
  public listen(listener: NavigationListener): () => void {
    // Filter for POP actions only - PUSH/REPLACE are handled synchronously
    const subscription = this.#state.subject
      .select((state) => state.current)
      .pipe(filter((update): update is NavigationUpdate<'POP'> => update.action === 'POP'))
      .subscribe((update) => {
        listener(update);
      });

    // Register subscription for cleanup on dispose
    this._addTeardown(subscription);

    // Return unsubscribe function
    return () => {
      subscription.unsubscribe();
      this._removeTeardown(subscription);
    };
  }

  /**
   * Registers a blocker to intercept navigation attempts.
   *
   * @param blocker - Navigation blocker function to register
   * @returns Function to unsubscribe the blocker
   */
  public block(blocker: NavigationBlocker): VoidFunction {
    this.#state.subject.next(this.#state.actions.addBlocker(blocker));
    const removeBlocker = () => {
      this.#state.subject.next(this.#state.actions.removeBlocker(blocker));
    };
    return this._addTeardown(removeBlocker, { executeOnRemove: true });
  }

  /**
   * Disposes of the history instance and cleans up all subscriptions.
   */
  public [Symbol.dispose](): void {
    this.#teardowns.unsubscribe();
  }

  /**
   * Dispatches an action to trigger state updates.
   *
   * Use this to dispatch actions when external events occur (e.g., browser popstate).
   * The action will be processed by flows and update the history state.
   *
   * @param action - The action to dispatch
   */
  protected _dispatch(action: Actions): void {
    this.#state.subject.next(action);
  }

  /**
   * Registers a cleanup function or subscription for automatic disposal.
   *
   * All teardowns are automatically cleaned up when the history instance is disposed.
   * Use `executeOnRemove: true` if the teardown should run when manually removed.
   *
   * @param teardown - Function or subscription to clean up
   * @param options - Optional configuration
   * @param options.executeOnRemove - Execute teardown when removed (default: false)
   * @returns Function to manually remove the teardown
   */
  protected _addTeardown(
    teardown: VoidFunction | Subscription,
    options?: { executeOnRemove: boolean },
  ): VoidFunction {
    this.#teardowns.add(teardown);
    return () => {
      if (options?.executeOnRemove) {
        typeof teardown === 'function' ? teardown() : teardown.unsubscribe();
      }
      return this._removeTeardown(teardown);
    };
  }

  /**
   * Removes a teardown from the cleanup collection.
   *
   * Typically called automatically by the function returned from `_addTeardown`.
   * Only call directly if you need to remove a teardown without executing it.
   *
   * @param teardown - The teardown to remove
   */
  protected _removeTeardown(teardown: VoidFunction | Subscription) {
    this.#teardowns.remove(teardown);
  }
}
