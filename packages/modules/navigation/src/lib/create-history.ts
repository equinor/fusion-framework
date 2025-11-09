import { MemoryHistory, type MemoryHistoryOptions } from './MemoryHistory';
import { BrowserHistory, type BrowserHistoryOptions } from './BrowserHistory';
import { BrowserHistoryStack } from './BrowserHistoryStack';
import { BrowserHistoryHashStack } from './BrowserHistoryHashStack';

type HistoryCtorMap = {
  memory: (options?: MemoryHistoryOptions) => MemoryHistory;
  browser: (options?: Omit<BrowserHistoryOptions, 'stack'>) => BrowserHistory;
  hash: (options?: Omit<BrowserHistoryOptions, 'stack'>) => BrowserHistory;
};

/**
 * Creates a history instance based on the specified type.
 *
 * Factory function for creating different history implementations:
 * - `'browser'`: Creates a {@link BrowserHistory} instance using regular routing (pathname-based)
 * - `'hash'`: Creates a {@link BrowserHistory} instance using hash routing (hash-based)
 * - `'memory'`: Creates a {@link MemoryHistory} instance for testing or SSR (in-memory)
 *
 * All returned instances are compatible with industry-standard routers (Remix/React Router).
 *
 * @param type - The type of history to create ('browser', 'hash', or 'memory')
 * @param args - Optional arguments for the history type
 * @returns A History instance compatible with industry-standard routers (Remix/React Router)
 *
 * @example
 * ```ts
 * // Regular browser routing
 * const history = createHistory('browser');
 *
 * // Hash-based routing
 * const hashHistory = createHistory('hash');
 *
 * // In-memory history for testing
 * const memoryHistory = createHistory('memory', { initialLocation: { ... } });
 * ```
 */
export const createHistory = <T extends keyof HistoryCtorMap>(
  type: T,
  ...args: Parameters<HistoryCtorMap[T]>
): ReturnType<HistoryCtorMap[T]> => {
  switch (type) {
    case 'memory':
      return new MemoryHistory(...(args as [MemoryHistoryOptions])) as ReturnType<
        HistoryCtorMap[T]
      >;
    case 'browser': {
      const options = args[0] as Omit<BrowserHistoryOptions, 'stack'>;
      return new BrowserHistory({ ...options, stack: BrowserHistoryStack }) as ReturnType<
        HistoryCtorMap[T]
      >;
    }
    case 'hash': {
      const options = args[0] as Omit<BrowserHistoryOptions, 'stack'>;
      return new BrowserHistory({ ...options, stack: BrowserHistoryHashStack }) as ReturnType<
        HistoryCtorMap[T]
      >;
    }
    default: {
      throw new Error(`Invalid history type: ${type}`);
    }
  }
};
