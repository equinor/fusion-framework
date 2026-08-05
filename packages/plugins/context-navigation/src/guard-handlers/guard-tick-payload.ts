import type { AppModulesInstance, FrameworkOptions } from '@equinor/fusion-framework-module-app';
import type { ContextModule } from '@equinor/fusion-framework-module-context';

/**
 * Payload emitted on each URL guard tick, carrying the resolved app identity
 * and its module instances so the guard can inspect app-level context state.
 */
export interface GuardTickPayload {
  /** The currently active app's key (used for URL scope checks). */
  appKey: string;
  /** The app's resolved module instances (provides access to context provider). */
  appModules: AppModulesInstance<[ContextModule]>;
  /** Routing strategy declared in the app manifest's build options. */
  routingStrategy?: FrameworkOptions['contextRouting'];
}
