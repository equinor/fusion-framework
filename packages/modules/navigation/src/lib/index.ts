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
export { BaseHistory } from './BaseHistory.js';
export { BrowserHistory } from './BrowserHistory.js';
export { MemoryHistory } from './MemoryHistory.js';
export { ProxyHistory } from './ProxyHistory.js';

// History stacks
export { BrowserHistoryStack } from './BrowserHistoryStack.js';
export { BrowserHistoryHashStack as HashHistoryStack } from './BrowserHistoryHashStack.js';
export { MemoryHistoryStack } from './MemoryHistoryStack.js';

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
} from './types.js';
