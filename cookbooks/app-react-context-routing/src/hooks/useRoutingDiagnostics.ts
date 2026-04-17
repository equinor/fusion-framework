/**
 * Hook that gathers all the diagnostic state shown in the
 * {@link RouteStatePanel}: active strategy, location, current context,
 * and how the initial context was resolved.
 *
 * @module useRoutingDiagnostics
 */

import { useModuleCurrentContext } from '@equinor/fusion-framework-react-module-context';
import { useLocation } from '@equinor/fusion-framework-react-router';

import { resolveStrategyLabel, type ContextMode } from '../utils/strategy';

/** Diagnostic snapshot returned by {@link useRoutingDiagnostics}. */
export interface RoutingDiagnostics {
  /** The routing strategy label displayed in the UI. */
  strategy: ContextMode;
  /** Application-relative pathname. */
  pathname: string;
  /** Application-relative search string. */
  search: string;
  /** Whether the search string contains a `$contextId` parameter. */
  hasQueryContextId: boolean;
  /** How the initial context was resolved (set once during init). */
  initSource: string;
  /** The currently active context object, if any. */
  currentContext: unknown;
}

/**
 * Collects routing diagnostics from the current URL, the context module,
 * and a global init-source marker set during app configuration.
 *
 * @returns A snapshot of all diagnostics values needed by the panel
 */
export function useRoutingDiagnostics(): RoutingDiagnostics {
  const { currentContext } = useModuleCurrentContext();
  const location = useLocation();
  const strategy = resolveStrategyLabel();
  const initSource =
    (globalThis as { __cookbookContextInitSource?: string }).__cookbookContextInitSource ??
    'unknown';

  return {
    strategy,
    pathname: location.pathname,
    search: location.search,
    hasQueryContextId: location.search.includes('$contextId='),
    initSource,
    currentContext,
  };
}
