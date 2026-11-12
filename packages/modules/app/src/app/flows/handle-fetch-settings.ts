import { from, of, concat, identity, type MonoTypeOperatorFunction } from 'rxjs';
import { catchError, filter, last, map, share, switchMap } from 'rxjs/operators';

import { actions } from '../actions.js';

import type { Flow } from '@equinor/fusion-observable';
import type { AppModuleProvider } from '../../AppModuleProvider.js';
import type { Actions } from '../actions.js';
import type { AppBundleState } from '../types.js';

/**
 * Handles the fetch settings action by fetching the app settings from the provider,
 * filtering out null values, and dispatching success or failure actions accordingly.
 *
 * @param provider The AppModuleProvider used to fetch the app settings.
 * @param measure - Optional observer of each request, e.g. operational telemetry; defaults to none.
 * @returns A Flow function that takes an Observable of actions and returns an Observable of actions.
 */
export const handleFetchSettings =
  (
    provider: AppModuleProvider,
    measure: MonoTypeOperatorFunction<Actions> = identity,
  ): Flow<Actions, AppBundleState> =>
  (action$) =>
    // only handle fetch settings request actions
    action$.pipe(
      filter(actions.fetchSettings.match),
      // when request is received, abort any ongoing request and start new
      switchMap(({ payload }) => {
        const { appKey } = payload;

        // fetch settings from provider
        const subject = from(provider.getAppSettings(appKey)).pipe(
          // filter out null values
          filter((x) => !!x),
          // allow multiple subscriptions
          share(),
        );

        // first load settings and then dispatch success action
        return concat(
          subject.pipe(map((settings) => actions.setSettings(settings))),
          subject.pipe(
            last(),
            map((settings) => actions.fetchSettings.success(settings)),
          ),
        ).pipe(
          // catch any error and dispatch failure action
          catchError((err) => {
            return of(actions.fetchSettings.failure(err));
          }),
          measure,
        );
      }),
    );
