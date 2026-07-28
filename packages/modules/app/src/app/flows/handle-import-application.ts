import { from, of } from 'rxjs';
import { catchError, filter, map, switchMap } from 'rxjs/operators';

import { actions } from '../actions';

import type { Flow } from '@equinor/fusion-observable';
import type { AppModuleProvider } from '../../AppModuleProvider';
import type { Actions } from '../actions';
import type { AppBundleState } from '../types';

/**
 * Handles the import application flow.
 * @param provider The AppModuleProvider used to resolve the application asset URI.
 * @returns A flow that takes in actions and returns an observable of AppBundleState.
 */
export const handleImportApplication =
  (provider: AppModuleProvider): Flow<Actions, AppBundleState> =>
  (action$) =>
    action$
      // only handle import script request actions
      .pipe(
        filter(actions.importApp.match),
        // when request is received, abort any ongoing request and start new
        switchMap(({ payload }) => {
          // dynamically import the application script
          return from(
            import(
              /* @vite-ignore */ /* webpackIgnore: true */
              [provider.assetUri, payload].join('/').replace(/\/{2,}/g, '/')
            ),
          ).pipe(
            // dispatch success action
            map(actions.importApp.success),
            // catch any error and dispatch failure action
            catchError((err) => of(actions.importApp.failure(err))),
          );
        }),
      );
