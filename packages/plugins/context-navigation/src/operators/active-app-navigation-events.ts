import { EMPTY, type Observable, combineLatestWith, map, switchMap } from 'rxjs';

import type {
  AppModuleProvider,
  AppModulesInstance,
  FrameworkOptions,
} from '@equinor/fusion-framework-module-app';
import type { ContextModule } from '@equinor/fusion-framework-module-context';
import type { INavigationProvider } from '@equinor/fusion-framework-module-navigation';

/**
 * Emission from the {@link activeAppNavigationEvents$} stream.
 *
 * Represents the snapshot of the currently active app and its resolved modules
 * at the moment a browser navigation state change occurred.
 */
export interface ActiveAppNavigationEvent {
  /** The key identifying the currently active application. */
  appKey: string;
  /** The app's resolved module instances, guaranteed to include the context module. */
  appModules: AppModulesInstance<[ContextModule]>;
  /** Routing strategy declared in the app manifest's build options. */
  routingStrategy?: FrameworkOptions['contextRouting'];
}

/**
 * RxJS operator factory that produces an emission each time the browser
 * navigation state changes while a fully resolved app is present.
 *
 * Intent: decouple the URL guard from the mechanics of observing app readiness.
 * The guard only needs to know "an app is active and a navigation just happened" —
 * this operator encapsulates the four-level observable plumbing required to
 * produce that signal:
 *
 * 1. **App switch** — outer `switchMap` on `app.current$`. If the portal switches
 *    to a different app (or clears the app), inner subscriptions auto-cancel.
 * 2. **Module + manifest resolution** — middle `switchMap` on
 *    `currentApp.instance$.pipe(combineLatestWith(currentApp.manifest$))`.
 *    Waits until both the app's lazy modules and its manifest have resolved.
 *    Emits EMPTY if modules are null.
 * 3. **Routing strategy extraction** — `manifest.build.options.contextRouting`
 *    is projected into the downstream payload so the guard can pass it to
 *    adapter resolution without a separate manifest lookup.
 * 4. **Navigation event** — inner `map` on `navigation.state$`. Each state change
 *    (push, replace, popstate) triggers a downstream emission carrying the
 *    resolved app key, modules, and routing strategy.
 *
 * @param app - The app module provider (source of `current$`).
 * @param navigation - The navigation provider (source of `state$`).
 * @returns An observable that emits `{ appKey, appModules }` on every navigation
 *          event while an active app with resolved modules is present.
 */
export function activeAppNavigationEvents$(
  app: AppModuleProvider,
  navigation: INavigationProvider,
): Observable<ActiveAppNavigationEvent> {
  return app.current$.pipe(
    // Cancel inner subscriptions when the active app changes or is cleared.
    switchMap((currentApp) =>
      !currentApp
        ? EMPTY
        : currentApp.instance$.pipe(
            combineLatestWith(currentApp.manifest$),
            // Wait for modules to resolve; bail if they're null (loading/error).
            switchMap(([appModules, manifest]) =>
              !appModules
                ? EMPTY
                : navigation.state$.pipe(
                    // Each state$ emission means a navigation happened — project
                    // the resolved app identity into the downstream payload.
                    map(() => ({
                      appKey: currentApp.appKey,
                      appModules: appModules as AppModulesInstance<[ContextModule]>,
                      routingStrategy: manifest?.build?.options?.contextRouting,
                    })),
                  ),
            ),
          ),
    ),
  );
}
