import { createBrowserHistory, createHashHistory, createMemoryHistory } from '@remix-run/router';
import type { History } from '@remix-run/router';

/**
 * Supported history types for navigation.
 */
type HistoryType = 'browser' | 'hash' | 'memory';

/**
 * Creates a history instance based on the specified type.
 *
 * @param type - The type of history to create:
 *   - `'browser'`: Uses the browser's History API (normal URLs)
 *   - `'hash'`: Uses hash-based routing (e.g., `#/path`)
 *   - `'memory'`: Uses in-memory history (useful for testing/SSR)
 *   - `undefined`: Defaults to browser history
 * @returns A history instance compatible with @remix-run/router
 * @throws {Error} Never throws, but logs a warning and falls back to browser history for unknown types
 *
 * @example
 * ```ts
 * // Browser history (default)
 * const history = createHistory();
 * const history = createHistory('browser');
 *
 * // Hash history
 * const history = createHistory('hash');
 *
 * // Memory history (for testing)
 * const history = createHistory('memory');
 * ```
 */
export const createHistory = (type?: HistoryType): History => {
  switch (type) {
    case 'hash':
      return createHashHistory();
    case 'memory':
      return createMemoryHistory();
    case 'browser':
      return createBrowserHistory();
    default: {
      // Fallback to browser history for unknown types
      console.warn(`Unknown history type: ${type}. Using browser history as default.`);
      return createHistory('browser');
    }
  }
};
