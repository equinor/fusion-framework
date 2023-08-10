import { from, of, merge } from 'rxjs';
import { catchError, filter, last, map, switchMap } from 'rxjs/operators';

import { actions } from './actions';

import type { Flow } from '@equinor/fusion-observable';
import type { AppModuleProvider } from '../AppModuleProvider';
import type { Actions } from './actions';
import { AppBundleState } from './types';

export const handleFetchManifest =
    (provider: AppModuleProvider): Flow<Actions, AppBundleState> =>
    (action$) =>
        action$.pipe(
            filter(actions.fetchManifest.match),
            switchMap(({ payload: appKey, meta: { update } }) => {
                const fetch$ = from(provider.getAppManifest(appKey)).pipe(
                    filter((x) => !!x),
                    map((manifest) => actions.setManifest(manifest, update)),
                );
                return merge(
                    fetch$,
                    fetch$.pipe(
                        last(),
                        map(({ payload }) => actions.fetchManifest.success(payload)),
                    ),
                ).pipe(
                    catchError((err) => {
                        return of(actions.fetchManifest.failure(err));
                    }),
                );
            }),
        );

export const handleFetchConfig =
    (provider: AppModuleProvider): Flow<Actions, AppBundleState> =>
    (action$) =>
        action$.pipe(
            filter(actions.fetchConfig.match),
            switchMap(({ payload: appKey }) => {
                const fetch$ = from(provider.getAppConfig(appKey)).pipe(map(actions.setConfig));
                return merge(
                    fetch$,
                    fetch$.pipe(
                        last(),
                        map(({ payload }) => actions.fetchConfig.success(payload)),
                    ),
                ).pipe(catchError((err) => of(actions.fetchConfig.failure(err))));
            }),
        );

export const handleImportApplication = (): Flow<Actions, AppBundleState> => (action$) =>
    action$.pipe(
        filter(actions.importApp.match),
        switchMap(({ payload }) => {
            return from(import(payload)).pipe(
                map(actions.importApp.success),
                catchError((err) => of(actions.importApp.failure(err))),
            );
        }),
    );
