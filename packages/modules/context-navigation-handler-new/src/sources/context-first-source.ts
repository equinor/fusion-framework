import { switchMap, EMPTY, of, combineLatestWith, distinctUntilChanged } from 'rxjs';

import type { AppModulesInstance } from '@equinor/fusion-framework-module-app';
import type { ContextModule } from '@equinor/fusion-framework-module-context';

import type { ReconcilerSourceFactory } from '../types';

/**
 * Context-first source factory — context changes lead, app follows.
 *
 * Stream composition:
 * ```
 * context.currentContext$ → combineLatestWith(app.current$ → app.instance$)
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
        distinctUntilChanged((a, b) => {
          if (a && b) {
            return a.id === b.id;
          }
          return a === b;
        }),
        combineLatestWith(
          app.current$.pipe(
            switchMap((currentApp) => {
              if (!currentApp) {
                return EMPTY;
              }
              return currentApp.instance$.pipe(
                switchMap((appModules) => {
                  if (!appModules) {
                    return EMPTY;
                  }
                  return of({
                    appModules: appModules as AppModulesInstance<[ContextModule]>,
                    appKey: currentApp.appKey,
                  });
                }),
              );
            }),
          ),
        ),
      )
      .pipe(
        switchMap(([contextState, { appModules, appKey }]) =>
          of({ appKey, appModules, contextState }),
        ),
      );
  };
};
