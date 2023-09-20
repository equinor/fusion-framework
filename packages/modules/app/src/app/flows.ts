import { from, of, concat } from 'rxjs';
import { catchError, filter, last, map, share, switchMap } from 'rxjs/operators';

import { actions } from './actions';

import type { Flow } from '@equinor/fusion-observable';
import type { AppModuleProvider } from '../AppModuleProvider';
import type { Actions } from './actions';
import type { AppBundleState } from './types';

export const handleFetchManifest =
    (provider: AppModuleProvider): Flow<Actions, AppBundleState> =>
    (action$) =>
        action$.pipe(
            filter(actions.fetchManifest.match),
            switchMap((action) => {
                const {
                    payload: appKey,
                    meta: { update },
                } = action;
                const subject = from(provider.getAppManifest(appKey)).pipe(
                    filter((x) => !!x),
                    share(),
                );
                return concat(
                    subject.pipe(map((manifest) => actions.setManifest(manifest, update))),
                    subject.pipe(
                        last(),
                        map((manifest) => actions.fetchManifest.success(manifest)),
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
                const subject = from(provider.getAppConfig(appKey)).pipe(
                    filter((x) => !!x),
                    share(),
                );
                return concat(
                    subject.pipe(map((manifest) => actions.setConfig(manifest))),
                    subject.pipe(
                        last(),
                        map((manifest) => actions.fetchConfig.success(manifest)),
                    ),
                ).pipe(
                    catchError((err) => {
                        return of(actions.fetchConfig.failure(err));
                    }),
                );
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
