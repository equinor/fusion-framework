/**
 * Internal history implementations, stacks, and types.
 *
 * @remarks
 * This sub-module is re-exported as `@equinor/fusion-framework-module-navigation/lib`
 * and provides the low-level building blocks for navigation state management.
 *
 * @packageDocumentation
 */

// History implementations
export { BaseHistory } from './BaseHistory';
export { BrowserHistory } from './BrowserHistory';
export { MemoryHistory } from './MemoryHistory';

// History stacks
export { BrowserHistoryStack } from './BrowserHistoryStack';
export { BrowserHistoryHashStack as HashHistoryStack } from './BrowserHistoryHashStack';
export { MemoryHistoryStack } from './MemoryStack';

// Types
export type {
  Action,
  History,
  HistoryStack,
  Location,
  NavigateOptions,
  NavigationListener,
  NavigationUpdate,
  Path,
  To,
} from './types';
