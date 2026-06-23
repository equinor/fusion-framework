import { switchMap, EMPTY, of, combineLatestWith, distinctUntilChanged } from 'rxjs';

import type { AppModulesInstance } from '@equinor/fusion-framework-module-app';
import type { ContextModule } from '@equinor/fusion-framework-module-context';

import { contextStateChanged, type ReconcilerSourceFactory } from './types';

/**
 * Context-first source factory — context changes lead, app follows.
 *
 * Stream composition:
 * ```
 * context.currentContext$ → combineLatestWith(app.current$ → combineLatest(instance$, manifest$))
 * ```
 *
 * Use this for **context-portal** where the selected context drives all
 * navigation. App switches are reconciled within the scope of the current
 * context.
 */
export const contextFirstSource = (): ReconcilerSourceFactory => {
  return ({ app, context }) => {
    return (
      context.currentContext$
        // Context is the primary signal — downstream app state reacts to each change
        // Deduplicate context changes and combine with the active app's instance and manifest
        .pipe(
          distinctUntilChanged(contextStateChanged),
          combineLatestWith(
            app.current$
              // Reactively pair context state with the active app's resolved instance and manifest
              // Resolve the active app to its instance and manifest — emits nothing until both are ready
              .pipe(
                switchMap((currentApp) => {
                  // No active app yet — nothing to reconcile against
                  if (!currentApp) {
                    return EMPTY;
                  }
                  return (
                    currentApp.instance$
                      // Both instance and manifest must be resolved — manifest provides the routing strategy
                      // Combine instance and manifest into a single resolved app shape
                      .pipe(
                        combineLatestWith(currentApp.manifest$),
                        switchMap(([appModules, manifest]) => {
                          // App is loading or failed to initialize — defer until instance is available
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
              ),
          ),
        )
        // Flatten the combined tuple into a unified reconciler input object
        .pipe(
          switchMap(([contextState, { appModules, appKey, routingStrategy }]) =>
            of({ appKey, appModules, contextState, routingStrategy }),
          ),
        )
    );
  };
};
