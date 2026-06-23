import { switchMap, EMPTY, of, combineLatestWith, distinctUntilChanged } from 'rxjs';

import type { AppModulesInstance } from '@equinor/fusion-framework-module-app';
import type { ContextModule } from '@equinor/fusion-framework-module-context';

import { contextStateChanged, type ReconcilerSourceFactory } from './types';

/**
 * App-first source factory — app switches lead, context follows.
 *
 * Stream composition:
 * ```
 * app.current$ → combineLatest(instance$, manifest$) → combineLatestWith(context.currentContext$)
 * ```
 *
 * Use this for **app-portal** where the active app determines the navigation
 * context. Context changes are reconciled within the scope of the current app.
 */
export const appFirstSource = (): ReconcilerSourceFactory => {
  return ({ app, context }) => {
    return (
      app.current$
        // Track the active app; each switch abandons the previous app's streams and starts fresh
        .pipe(
          switchMap((currentApp) => {
            // No active app yet (e.g. initial load or app unmounted) — nothing to reconcile
            if (!currentApp) {
              return EMPTY;
            }
            return (
              currentApp.instance$
                // Wait for both the module instance and the manifest to resolve before projecting downstream
                .pipe(
                  combineLatestWith(currentApp.manifest$),
                  switchMap(([appModules, manifest]) => {
                    // App is registered but its module bundle hasn't resolved yet — skip until it's ready
                    if (!appModules) {
                      return EMPTY;
                    }
                    return of({
                      appModules: appModules as AppModulesInstance<[ContextModule]>,
                      appKey: currentApp.appKey,
                      routingStrategy: manifest?.build?.options?.contextRouting,
                    });
                  }),
                )
            );
          }),
          combineLatestWith(
            context.currentContext$
              // Suppress redundant reconciler runs when context identity hasn't actually changed
              .pipe(distinctUntilChanged(contextStateChanged)),
          ),
          switchMap(([{ appModules, appKey, routingStrategy }, contextState]) =>
            of({ appKey, appModules, contextState, routingStrategy }),
          ),
        )
    );
  };
};
