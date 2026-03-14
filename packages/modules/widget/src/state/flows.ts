import { from, of, concat } from 'rxjs';
import { catchError, filter, last, map, share, switchMap } from 'rxjs/operators';

import { actions } from './actions';

import type { Flow } from '@equinor/fusion-observable';

import type { Actions } from './actions';
import type { WidgetState } from '../types';
import type WidgetModuleProvider from '../WidgetModuleProvider';

/**
 * RxJS flow that reacts to `fetchManifest` actions by querying the
 * {@link WidgetModuleProvider} for the manifest, emitting intermediate
 * `setManifest` actions, and completing with a success or failure action.
 *
 * @param provider - The widget module provider used for API queries.
 * @returns A `Flow` function for the widget state machine.
 */
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
            console.error(err, action.payload);
            return of(actions.fetchManifest.failure(err));
          }),
        );
      }),
    );

/**
 * RxJS flow that reacts to `fetchConfig` actions by querying the
 * {@link WidgetModuleProvider} for the widget config, emitting intermediate
 * `setConfig` actions, and completing with a success or failure action.
 *
 * @param provider - The widget module provider used for API queries.
 * @returns A `Flow` function for the widget state machine.
 */
export const handleFetchConfig =
  (provider: WidgetModuleProvider): Flow<Actions, WidgetState> =>
  (action$) =>
    action$.pipe(
      filter(actions.fetchConfig.match),
      switchMap(({ payload: { key, args } }) => {
        const subject = from(provider.getWidgetConfig(key, args)).pipe(
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

/**
 * RxJS flow that reacts to `importWidget` actions by dynamically importing
 * the widget’s JavaScript entry point URL and emitting success or failure.
 *
 * @returns A `Flow` function for the widget state machine.
 */
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
