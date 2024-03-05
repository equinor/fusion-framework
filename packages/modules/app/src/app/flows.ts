import { from, of, concat } from 'rxjs';
import { catchError, filter, last, map, share, switchMap } from 'rxjs/operators';

import { actions } from './actions';

import type { Flow } from '@equinor/fusion-observable';
import type { AppModuleProvider } from '../AppModuleProvider';
import type { Actions } from './actions';
import type { AppBundleState } from './types';

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
        action$.pipe(
            // only handle fetch manifest request actions
            filter(actions.fetchManifest.match),
            // when request is received, abort any ongoing request and start new
            switchMap((action) => {
                const {
                    payload: appKey,
                    meta: { update },
                } = action;

                // fetch manifest from provider
                const subject = from(provider.getAppManifest(appKey)).pipe(
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
        action$.pipe(
            // only handle fetch config request actions
            filter(actions.fetchConfig.match),
            // when request is received, abort any ongoing request and start new
            switchMap(({ payload: appKey }) => {
                // fetch manifest from provider
                const subject = from(provider.getAppConfig(appKey)).pipe(
                    // filter out null values
                    filter((x) => !!x),
                    // allow multiple subscriptions
                    share(),
                );
                // first load manifest and then dispatch success action
                return concat(
                    subject.pipe(map((manifest) => actions.setConfig(manifest))),
                    subject.pipe(
                        last(),
                        map((manifest) => actions.fetchConfig.success(manifest)),
                    ),
                ).pipe(
                    // catch any error and dispatch failure action
                    catchError((err) => {
                        return of(actions.fetchConfig.failure(err));
                    }),
                );
            }),
        );

/**
 * Handles the import application flow.
 * @returns A flow that takes in actions and returns an observable of AppBundleState.
 */
export const handleImportApplication = (): Flow<Actions, AppBundleState> => (action$) =>
    action$.pipe(
        // only handle import script request actions
        filter(actions.importApp.match),
        // when request is received, abort any ongoing request and start new
        switchMap(({ payload }) => {
            // dynamically import the application script
            return from(import(payload)).pipe(
                // dispatch success action
                map(actions.importApp.success),
                // catch any error and dispatch failure action
                catchError((err) => of(actions.importApp.failure(err))),
            );
        }),
    );
