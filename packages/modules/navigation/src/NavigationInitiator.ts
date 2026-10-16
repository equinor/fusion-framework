import type { History, To } from './lib/types.js';

/**
 * Navigation strategy supplied by a portal (or any host that owns the browser URL).
 *
 * The app navigates through the host's history, scoped to `basename`. The host
 * keeps ownership of the history: the navigation module only wraps it, and never
 * disposes it.
 */
export type HostNavigationInitiator = {
  readonly kind: 'host';
  /** History owned by the host. Never disposed by the navigation module. */
  readonly history: History;
  /** Pathname prefix the host serves the app under (for example `/apps/my-app`). */
  readonly basename: string;
};

/**
 * Navigation strategy for isolated rendering, such as a widget.
 *
 * Every app instance gets a new in-memory history that is owned (and disposed)
 * by the navigation module. `window.location` is neither read nor modified.
 */
export type MemoryNavigationInitiator = {
  readonly kind: 'memory';
  /**
   * Initial location, relative to `basename`. Defaults to the app root.
   * A location already inside `basename` is used as given.
   */
  readonly initialLocation?: To;
  /** Optional pathname prefix the app is mounted under. */
  readonly basename?: string;
};

/**
 * Navigation strategy supplied by whoever initiates the app or widget.
 *
 * Precedence: explicit app navigation configuration, then the initiator
 * strategy, then standalone browser defaults.
 */
export type NavigationInitiator = HostNavigationInitiator | MemoryNavigationInitiator;

/** Navigation setting that can conflict with an initiator constraint. */
export type NavigationConflictSetting = 'basename' | 'history';
