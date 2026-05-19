import { switchMap, EMPTY, of, combineLatestWith, distinctUntilChanged } from 'rxjs';

import type { AppModulesInstance } from '@equinor/fusion-framework-module-app';
import type { ContextModule } from '@equinor/fusion-framework-module-context';

import type { ReconcilerSourceFactory } from '../types';

/**
 * App-first source factory — app switches lead, context follows.
 *
 * Stream composition:
 * ```
 * app.current$ → app.instance$ → combineLatestWith(context.currentContext$)
 * ```
 *
 * Use this for **app-portal** where the active app determines the navigation
 * context. Context changes are reconciled within the scope of the current app.
 */
export const createAppFirstSource = (): ReconcilerSourceFactory => {
  return ({ app, context }) => {
    return app.current$.pipe(
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
      combineLatestWith(
        context.currentContext$.pipe(
          distinctUntilChanged((a, b) => {
            if (a && b) {
              return a.id === b.id;
            }
            return a === b;
          }),
        ),
      ),
      switchMap(([{ appModules, appKey }, contextState]) =>
        of({ appKey, appModules, contextState }),
      ),
    );
  };
};
