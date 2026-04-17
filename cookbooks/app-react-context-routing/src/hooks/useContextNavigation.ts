/**
 * Hook that preserves the active context id in the URL when navigating
 * between routes inside the cookbook app.
 *
 * Depending on the routing strategy, the context id may live in a path
 * segment or in the query string. This hook resolves the correct target
 * URL shape so callers can navigate with a single `navigateTo(path)` call.
 *
 * @module useContextNavigation
 */

import { useLocation, useNavigate } from '@equinor/fusion-framework-react-router';

import { resolveStrategyLabel } from '../utils/strategy';
import { STATIC_ROUTES } from '../constants';

/**
 * Extracts the context-id prefix from a path-strategy URL where the
 * context id is the first segment.
 *
 * @param pathname - Application-relative pathname
 * @returns The prefix string (e.g. `'/abc-123'`) or empty string
 */
const resolvePathContextPrefix = (pathname: string): string => {
  const [firstSegment] = pathname.split('/').filter(Boolean);

  if (!firstSegment || STATIC_ROUTES.has(firstSegment)) {
    return '';
  }

  return `/${firstSegment}`;
};

/**
 * Extracts the context-id suffix from a custom-strategy URL where the
 * context id appears after the route segment.
 *
 * @param pathname - Application-relative pathname
 * @returns The suffix string (e.g. `'/abc-123'`) or empty string
 */
const resolveCustomContextSuffix = (pathname: string): string => {
  const segments = pathname.split('/').filter(Boolean);
  const lastSegment = segments.at(-1);

  if (!lastSegment) {
    return '';
  }

  if (segments.length === 1) {
    return STATIC_ROUTES.has(lastSegment) ? '' : `/${lastSegment}`;
  }

  if (segments.length === 2 && STATIC_ROUTES.has(segments[0])) {
    return `/${lastSegment}`;
  }

  return '';
};

/**
 * Provides a `navigateTo` function that navigates to an app-relative path
 * while preserving the active context id in its strategy-specific position.
 *
 * @returns Object with the `navigateTo` callback
 *
 * @example
 * ```tsx
 * const { navigateTo } = useContextNavigation();
 * <Button onClick={() => navigateTo('/route-a')}>Route A</Button>
 * ```
 */
export function useContextNavigation(): { navigateTo: (pathname: string) => void } {
  const navigate = useNavigate();
  const location = useLocation();

  const navigateTo = (pathname: string): void => {
    const strategy = resolveStrategyLabel();

    if (strategy === 'custom') {
      const suffix = resolveCustomContextSuffix(location.pathname);
      navigate({ pathname: `${pathname}${suffix}`, search: location.search });
      return;
    }

    // For path / none strategies, prepend the context-id segment
    const prefix =
      strategy === 'path' || strategy === 'none' ? resolvePathContextPrefix(location.pathname) : '';

    navigate({ pathname: `${prefix}${pathname}`, search: location.search });
  };

  return { navigateTo };
}
