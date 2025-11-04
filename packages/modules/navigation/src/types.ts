/**
 * Navigation action type.
 */
export type Action = 'PUSH' | 'POP' | 'REPLACE';

/**
 * Type definitions inferred from @remix-run/router for compatibility.
 */
export type To = string | Partial<Path>;
export type Path = {
  pathname: string;
  search: string;
  hash: string;
};
export type Location = Path & {
  state: unknown;
  key: string;
};

/**
 * Local History interface inferred from @remix-run/router.
 * This abstraction avoids direct dependency on external types while maintaining compatibility.
 */
export interface History {
  readonly action: Action;
  readonly location: Location;
  createHref(to: To): string;
  createURL(to: To): URL;
  encodeLocation(to: To): Path;
  push(to: To, state?: unknown): void;
  replace(to: To, state?: unknown): void;
  go(delta: number): void;
  listen(listener: (update: { action: Action; location: Location }) => void): () => void;
}

/**
 * Type alias for the navigation listener function.
 * This is the callback type used when listening to history changes.
 */
export type NavigationListener = Parameters<History['listen']>[0];

/**
 * Type alias for navigation update events.
 * Represents the state passed to navigation listeners when the location changes.
 * Contains action (PUSH, POP, REPLACE) and location information.
 */
export type NavigationUpdate = Parameters<NavigationListener>[0];
