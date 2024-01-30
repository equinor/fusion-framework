import { from, of, concat } from 'rxjs';
import { catchError, filter, last, map, share, switchMap } from 'rxjs/operators';

import { actions } from './actions';

import type { Flow } from '@equinor/fusion-observable';

import type { Actions } from './actions';
import { WidgetState } from '../types';
import type WidgetModuleProvider from '../WidgetModuleProvider';

export const handleFetchManifest =
    (provider: WidgetModuleProvider): Flow<Actions, WidgetState> =>
    (action$) =>
        action$.pipe(
            filter(actions.fetchManifest.match),
            switchMap((action) => {
                const {
                    payload: { key, args },
                    meta: { update },
                } = action;

                const subject = from(provider.getWidgetManifest(key, args)).pipe(
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
                        console.log(err, action.payload);
                        return of(actions.fetchManifest.failure(err));
                    }),
                );
            }),
        );

export const handleFetchConfig =
    (provider: WidgetModuleProvider): Flow<Actions, WidgetState> =>
    (action$) =>
        action$.pipe(
            filter(actions.fetchConfig.match),
            switchMap(({ payload: key }) => {
                const subject = from(provider.getWidgetConfig(key)).pipe(
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

export const handleImportWidget = (): Flow<Actions, WidgetState> => (action$) =>
    action$.pipe(
        filter(actions.importWidget.match),
        switchMap(({ payload }) => {
            return from(import(/* @vite-ignore */ payload)).pipe(
                map(actions.importWidget.success),
                catchError((err) => of(actions.importWidget.failure(err))),
            );
        }),
    );
