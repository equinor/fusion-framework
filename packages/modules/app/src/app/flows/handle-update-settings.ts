import { from, of } from 'rxjs';
import { catchError, concatMap, filter, last, switchMap } from 'rxjs/operators';

import { actions } from '../actions';

import type { Flow } from '@equinor/fusion-observable';
import type { AppModuleProvider } from '../../AppModuleProvider';
import type { Actions } from '../actions';
import type { AppBundleState } from '../types';

/**
 * Handles the set settings action by setting the app settings from the provider,
 * filtering out null values, and dispatching success or failure actions accordingly.
 *
 * @param provider The AppModuleProvider used to fetch the app settings.
 * @returns A Flow function that takes an Observable of actions and returns an Observable of actions.
 */
export const handleUpdateSettings =
  (provider: AppModuleProvider): Flow<Actions, AppBundleState> =>
  (action$) => {
    return (
      action$
        // only handle update settings request actions
        .pipe(
          filter(actions.updateSettings.match),
          switchMap(({ payload }) => {
            const { appKey, settings } = payload;
            return (
              provider
                .updateAppSettings(appKey, settings)
                // take the last value, then request updating of settings and dispatch success or failure
                .pipe(
                  last(),
                  concatMap((updatedSettings) =>
                    from([
                      actions.setSettings(updatedSettings),
                      actions.updateSettings.success(updatedSettings),
                    ]),
                  ),
                  catchError((err) => of(actions.updateSettings.failure(err))),
                )
            );
          }),
        )
    );
  };
