import { from, of, concat } from 'rxjs';
import { catchError, filter, last, map, share, switchMap } from 'rxjs/operators';

import { actions } from '../actions';

import type { Flow } from '@equinor/fusion-observable';
import type { AppModuleProvider } from '../../AppModuleProvider';
import type { Actions } from '../actions';
import type { AppBundleState } from '../types';

/**
 * Handles the fetch manifest action by fetching the app manifest from the provider,
 * dispatching success or failure actions based on the result.
 *
 * @param provider The AppModuleProvider used to fetch the app manifest.
 * @returns A Flow function that takes an Observable of actions and returns an Observable of actions.
 */
export const handleFetchManifest =
  (provider: AppModuleProvider): Flow<Actions, AppBundleState> =>
  (action$) =>
    // only handle fetch manifest request actions
    action$.pipe(
      filter(actions.fetchManifest.match),
      // when request is received, abort any ongoing request and start new
      switchMap((action) => {
        const {
          payload: { key, tag },
          meta: { update },
        } = action;

        // fetch manifest from provider
        const subject = from(provider.getAppManifest(key, tag)).pipe(
          // filter out null values
          filter((x) => !!x),
          // allow multiple subscriptions
          share(),
        );

        // first load manifest and then dispatch success action
        return concat(
          subject.pipe(map((manifest) => actions.setManifest(manifest, update))),
          subject.pipe(
            last(),
            map((manifest) => actions.fetchManifest.success(manifest)),
          ),
        ).pipe(
          // catch any error and dispatch failure action
          catchError((err) => {
            return of(actions.fetchManifest.failure(err));
          }),
        );
      }),
    );
