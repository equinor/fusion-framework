import { fromEvent } from 'rxjs';
import { map } from 'rxjs/operators';
import { BaseHistory } from './BaseHistory';
import { BrowserHistoryStack } from './BrowserHistoryStack';
import { BrowserHistoryHashStack } from './BrowserHistoryHashStack';
import { resolveWindowLocation } from './utils';
import { Action, type HistoryStack, type NavigationBlocker } from './types';
import { createStore, createHistoryReducer, actions } from './state';

/**
 * Handler for beforeunload events.
 * Prevents page unload when navigation blockers are active.
 */
const onBeforeUnload = (event: BeforeUnloadEvent) => {
  event.preventDefault();
  event.returnValue = '';
};
/**
 * Constructor for a HistoryStack implementation.
 *
 * @param window - The window object to use for history operations
 * @returns A new instance of the HistoryStack implementation
 */
export interface StackConstructor {
  new (window: Window): HistoryStack;
}

/**
 * Options for configuring a BrowserHistory instance.
 */
export type BrowserHistoryOptions = {
  /** Optional window object (defaults to global window) */
  window?: Window;
  /** Optional stack constructor (defaults to BrowserHistoryStack, use BrowserHistoryHashStack for hash routing) */
  stack?: StackConstructor;
};

/**
 * Browser history implementation using native browser APIs.
 *
 * Uses the browser's History API (pushState/replaceState) for navigation.
 * Automatically listens for popstate/hashchange events to detect browser back/forward navigation.
 * Compatible with industry-standard routers (Remix/React Router).
 */
export class BrowserHistory extends BaseHistory {
  #window: Window;
  /**
   * Creates a browser history instance.
   *
   * Initializes with the current window location and sets up listeners for
   * browser navigation events (popstate for regular routing, hashchange for hash routing).
   *
   * @param options - Configuration options
   * @param options.window - Window object to use (defaults to global window)
   * @param options.stack - Stack implementation (defaults to BrowserHistoryStack, use BrowserHistoryHashStack for hash routing)
   * @throws {Error} If window is not available
   */
  constructor(options: BrowserHistoryOptions = {}) {
    // Use provided stack or default to BrowserHistoryStack
    const Stack: StackConstructor = options.stack ?? BrowserHistoryStack;
    const browserWindow = options.window ?? document.defaultView;
    if (!browserWindow) {
      throw new Error('Window is required');
    }

    // Initialize state with current window location
    const state = createStore(
      new Stack(browserWindow),
      createHistoryReducer({
        delta: 0,
        action: Action.Pop,
        location: resolveWindowLocation(browserWindow, browserWindow.history),
      }),
    );
    super(state);

    this.#window = browserWindow;

    // Determine event type based on stack implementation
    // Hash routing uses 'hashchange', regular routing uses 'popstate'
    const isHashHistory = state.stack instanceof BrowserHistoryHashStack;
    const eventName = isHashHistory ? 'hashchange' : 'popstate';

    // Listen for browser navigation events and dispatch POP actions
    // This handles browser back/forward button clicks
    this._addTeardown(
      fromEvent(browserWindow, eventName)
        .pipe(
          map(() => {
            const location = state.stack.current;
            return actions.pop({ delta: 0, action: Action.Pop, location });
          }),
        )
        .subscribe(this._dispatch.bind(this)),
    );
  }

  /**
   * Registers a blocker to intercept navigation attempts.
   *
   * Adds a beforeunload event listener when blockers are active to prevent
   * page unload (e.g., when user tries to close the tab). This provides
   * browser-level protection in addition to in-app navigation blocking.
   *
   * @param blocker - Navigation blocker function to register
   * @returns Function to unsubscribe the blocker
   */
  public override block(blocker: NavigationBlocker): VoidFunction {
    const unblock = super.block(blocker);
    // Add beforeunload listener when blockers are active
    // This shows browser's "Leave site?" dialog on page unload
    if (this.hasBlockers) {
      window.addEventListener('beforeunload', onBeforeUnload);
    }
    return () => {
      unblock();
      // Remove beforeunload listener if no blockers remain
      if (this.hasBlockers) {
        window.removeEventListener('beforeunload', onBeforeUnload);
      }
    };
  }
}
