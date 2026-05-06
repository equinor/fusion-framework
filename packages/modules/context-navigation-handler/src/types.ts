import type { ContextItem } from '@equinor/fusion-framework-module-context';

// ─── Strategy Contract ──────────────────────────────────────────────

/**
 * A routing strategy encodes/decodes context identity in the URL.
 *
 * Implementations must be **pure** — no side effects, no navigation calls.
 * The reconciler handles all navigation; strategies only compute URLs.
 */
export interface ContextRoutingStrategy {
  /** Identifier for this strategy. */
  readonly id: RoutingStrategyId;

  /**
   * Build a URL that encodes the given context.
   *
   * @param context - The context to encode, or `null` to clear context from URL.
   * @param currentURL - The current browser URL (absolute).
   * @returns The target URL with context encoded, or `null` to skip navigation.
   */
  encode(context: ContextItem | null, currentURL: URL): URL | null;

  /**
   * Extract the context id from a URL.
   *
   * @param url - The URL to decode.
   * @returns The context id if present, or `null` if not found.
   */
  decode(url: URL): string | null;
}

// ─── Strategy Identifiers ───────────────────────────────────────────

export type RoutingStrategyId = 'path' | 'query' | 'custom';

// ─── Context States ─────────────────────────────────────────────────

/**
 * The reconciler's view of context state.
 *
 * - `undefined` — context not yet resolved (initializing)
 * - `null` — context intentionally cleared
 * - `ContextItem` — active context
 */
export type ContextState = ContextItem | null | undefined;

// ─── Reconciler State Machine ───────────────────────────────────────

export type ReconcilerPhase = 'idle' | 'active' | 'cleared';

// ─── Events ─────────────────────────────────────────────────────────

/** Fired before reconciliation navigates. Cancelable. */
export interface ContextNavigationHandlerNavigateDetail {
  /** The app that owns the context. */
  appKey: string;
  /** The strategy used. */
  strategy: RoutingStrategyId;
  /** The URL being navigated to. */
  targetURL: URL;
  /** The current URL before navigation. */
  sourceURL: URL;
  /** The context being applied. */
  context: ContextItem | null;
}

/** Fired after navigation completes. */
export interface ContextNavigationHandlerNavigatedDetail {
  appKey: string;
  strategy: RoutingStrategyId;
  targetURL: URL;
  context: ContextItem | null;
}

/** Fired when a strategy is resolved for an app. */
export interface ContextNavigationHandlerStrategyResolvedDetail {
  appKey: string;
  strategy: RoutingStrategyId;
}

/** Fired when reconciliation skips (URL already correct). */
export interface ContextNavigationHandlerSkippedDetail {
  appKey: string;
  reason: 'url-matches' | 'no-context' | 'encode-returned-null' | 'canceled' | 'context-not-supported';
}

// ─── Configuration ──────────────────────────────────────────────────

/**
 * Configuration for the context-navigation-handler module.
 */
export interface ContextNavigationHandlerConfig {
  /**
   * Human-readable name for the portal consuming this module.
   * Used in event details and debug logging.
   * @default 'Portal'
   */
  portalName: string;

  /**
   * Origin for constructing absolute URLs.
   * @default window.location.origin
   */
  origin: string;

  /**
   * Map of strategy id → strategy implementation.
   * Override individual strategies or provide all three.
   */
  strategies: Record<RoutingStrategyId, ContextRoutingStrategy>;

  /**
   * Enable reconciliation on URL changes (guard behavior).
   * When enabled, URL changes that accidentally drop context trigger re-sync.
   * @default true
   */
  enableUrlGuard: boolean;

  /**
   * Enable verbose debug logging.
   * @default false
   */
  debug: boolean;

  /**
   * Optional side-effect hook called after navigation completes.
   * Use for legacy compat (e.g. resetting old app routers).
   */
  onTransition?: (detail: ContextNavigationHandlerNavigatedDetail) => void;
}
