import type { IEventModuleProvider } from '@equinor/fusion-framework-module-event';
import type { INavigationProvider } from '@equinor/fusion-framework-module-navigation';

// Import event type augmentations so the event name is recognized
import '../events';

const LEGACY_NAVIGATION_VERSION = 7;

/**
 * Dependencies required by the legacy app navigation fix.
 */
interface LegacyAppNavigationFixDeps {
  /** The framework event module provider. */
  event: IEventModuleProvider;
}

/**
 * Register a legacy app navigation fix that resets the app's internal
 * router when context navigation occurs and the app uses a navigation
 * module older than v7.
 *
 * Apps with navigation <v7 don't respond to portal navigation events
 * correctly. This listener detects them and calls `appNavigation.replace('/')`
 * after each context navigation to keep the app router in sync.
 *
 * Call this during framework configuration (e.g. in `postInitialize`)
 * and store the returned teardown function to clean up when needed.
 *
 * @param deps - The required framework module instances.
 * @returns A teardown function that removes the listener.
 *
 * @example
 * ```ts
 * // In portal framework configuration:
 * const teardown = enableLegacyAppNavigationFix({ event });
 * ```
 */
export function enableLegacyAppNavigationFix(deps: LegacyAppNavigationFixDeps): VoidFunction {
  const { event } = deps;

  return event.addEventListener('onContextNavigationNavigated', (e) => {
    // Only act when context is cleared — regular navigation doesn't need fixing
    if (e.detail.context !== null) {
      return;
    }

    const { appKey, appModules } = e.detail;

    const appNavigation = (appModules as { navigation?: INavigationProvider }).navigation;
    if (!appNavigation) {
      return;
    }

    if (appNavigation.version.major < LEGACY_NAVIGATION_VERSION) {
      console.warn(
        `[ContextNavigation] App [${appKey}] uses navigation v${appNavigation.version.major} (< ${LEGACY_NAVIGATION_VERSION}). Resetting app router to keep it in sync.`,
      );
      appNavigation.replace('/');
    }
  });
}
