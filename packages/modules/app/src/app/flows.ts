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
            switchMap(({ payload }) => {
                // TODO - use the configUrl directly from the manifest
                // fetch config from provider
                const subject = from(
                    provider.getAppConfig(payload.appKey, payload.build?.version),
                ).pipe(
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

/**
 * Handles the fetch settings action by fetching the app settings from the provider,
 * filtering out null values, and dispatching success or failure actions accordingly.
 *
 * @param provider The AppModuleProvider used to fetch the app settings.
 * @returns A Flow function that takes an Observable of actions and returns an Observable of actions.
 */
export const handleFetchSettings =
    (provider: AppModuleProvider): Flow<Actions, AppBundleState> =>
    (action$) =>
        action$.pipe(
            // only handle fetch settings request actions
            filter(actions.fetchSettings.match),
            // when request is received, abort any ongoing request and start new
            switchMap((action) => {
                const { payload: appKey } = action;

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
                );
            }),
        );

/**
 * Handles the import application flow.
 * @returns A flow that takes in actions and returns an observable of AppBundleState.
 */
export const handleImportApplication =
    (provider: AppModuleProvider): Flow<Actions, AppBundleState> =>
    (action$) =>
        action$.pipe(
            // only handle import script request actions
            filter(actions.importApp.match),
            // when request is received, abort any ongoing request and start new
            switchMap(({ payload }) => {
                const endpoint = [provider.assetUri, payload].join('/').replace(/\/{2,}/g, '/');
                // dynamically import the application script
                return from(import(/* @vite-ignore */ endpoint)).pipe(
                    // dispatch success action
                    map(actions.importApp.success),
                    // catch any error and dispatch failure action
                    catchError((err) => of(actions.importApp.failure(err))),
                );
            }),
        );
