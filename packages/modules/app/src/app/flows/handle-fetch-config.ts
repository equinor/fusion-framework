import { from, of, concat } from 'rxjs';
import { catchError, filter, last, map, share, switchMap } from 'rxjs/operators';

import { actions } from '../actions';

import type { Flow } from '@equinor/fusion-observable';
import type { AppModuleProvider } from '../../AppModuleProvider';
import type { Actions } from '../actions';
import type { AppBundleState } from '../types';

/**
 * Handles the fetch config action by fetching the app configuration from the provider,
 * filtering out null values, and dispatching success or failure actions accordingly.
 *
 * @param provider The AppModuleProvider used to fetch the app configuration.
 * @returns A Flow function that takes an Observable of actions and returns an Observable of actions.
 */
export const handleFetchConfig =
  (provider: AppModuleProvider): Flow<Actions, AppBundleState> =>
  (action$) =>
    action$
      // only handle fetch config request actions
      .pipe(
        filter(actions.fetchConfig.match),
        // when request is received, abort any ongoing request and start new
        switchMap(({ payload }) => {
          // TODO(#5127) - use the configUrl directly from the manifest
          // fetch config from provider
          const subject = from(provider.getAppConfig(payload.appKey, payload.build?.version)).pipe(
            // filter out null values
            filter((x) => !!x),
            // allow multiple subscriptions
            share(),
          );
          // first load config and then dispatch success action
          return concat(
            subject.pipe(map((config) => actions.setConfig(config))),
            subject.pipe(
              last(),
              map((config) => actions.fetchConfig.success(config)),
            ),
          ).pipe(
            // catch any error and dispatch failure action
            catchError((err) => {
              return of(actions.fetchConfig.failure(err));
            }),
          );
        }),
      );
