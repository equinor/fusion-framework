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
 * - `'browser'`: Creates a {@link BrowserHistory} using pathname-based routing
 * - `'hash'`: Creates a {@link BrowserHistory} using hash-based routing (`#/path`)
 * - `'memory'`: Creates a {@link MemoryHistory} for testing, SSR, or widget apps
 *
 * @param type - The type of history to create (`'browser'`, `'hash'`, or `'memory'`)
 * @param args - Optional arguments forwarded to the history constructor
 * @returns A {@link History} instance of the requested type
 * @throws {Error} If `type` is not one of `'browser'`, `'hash'`, or `'memory'`
 *
 * @example
 * ```ts
 * const history = createHistory('browser');
 * const hashHistory = createHistory('hash');
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
