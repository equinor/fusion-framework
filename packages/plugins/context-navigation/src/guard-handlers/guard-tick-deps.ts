import type { IContextProvider } from '@equinor/fusion-framework-module-context';

import type { ContextNavigationConfig } from '../types';
import type { ApplyNavigationDeps, OwnNavigationTokens } from '../apply-navigation';

/**
 * Dependencies required by the URL guard handler functions.
 *
 * Extends {@link ApplyNavigationDeps} with the context provider needed
 * to drive context from the URL in push mode.
 */
export interface GuardTickDeps extends ApplyNavigationDeps {
  /** Resolved plugin configuration (adapters, navigation options). */
  config: ContextNavigationConfig;
  /** Context provider for setting context from URL-decoded IDs in push mode. */
  context: IContextProvider;
  /** Own-navigation token set (inherited from ApplyNavigationDeps). */
  ownNavTokens: OwnNavigationTokens;
  /** Conditional debug logger. */
  log: (msg: string) => void;
}
