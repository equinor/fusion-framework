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
export const createContextFirstSource = (): ReconcilerSourceFactory => {
  return ({ app, context }) => {
    return context.currentContext$
      .pipe(
        distinctUntilChanged(contextStateChanged),
        combineLatestWith(
          app.current$.pipe(
            switchMap((currentApp) => {
              if (!currentApp) {
                return EMPTY;
              }
              return currentApp.instance$.pipe(
                combineLatestWith(currentApp.manifest$),
                switchMap(([appModules, manifest]) => {
                  if (!appModules) {
                    return EMPTY;
                  }
                  return of({
                    appModules: appModules as AppModulesInstance<[ContextModule]>,
                    appKey: currentApp.appKey,
                    routingStrategy: manifest?.build?.options?.contextRouting,
                  });
                }),
              );
            }),
          ),
        ),
      )
      .pipe(
        switchMap(([contextState, { appModules, appKey, routingStrategy }]) =>
          of({ appKey, appModules, contextState, routingStrategy }),
        ),
      );
  };
};
