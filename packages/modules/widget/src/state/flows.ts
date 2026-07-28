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
    action$
      // React only to `fetchManifest` actions
      .pipe(
        filter(actions.fetchManifest.match),
        switchMap((action) => {
          const {
            payload: { key, args },
            meta: { update },
          } = action;

          const subject = from(provider.getWidgetManifest(key, args))
            // Query the provider for the manifest, dropping falsy emissions, and share it
            .pipe(
              filter((x) => !!x),
              share(),
            );
          return (
            concat(
              subject
                // Emit an intermediate `setManifest` for every value the query produces
                .pipe(map((manifest) => actions.setManifest(manifest, update))),
              subject
                // Wait for the final emission and report it as the successful result
                .pipe(
                  last(),
                  map((manifest) => actions.fetchManifest.success(manifest)),
                ),
            )
              // Convert any error from the query/emission chain into a failure action
              .pipe(
                catchError((err) => {
                  console.error(err, action.payload);
                  return of(actions.fetchManifest.failure(err));
                }),
              )
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
// Deliberately co-located with `handleFetchManifest` above
// fusion-lint-disable-next-line single-export-per-file
export const handleFetchConfig =
  (provider: WidgetModuleProvider): Flow<Actions, WidgetState> =>
  (action$) =>
    action$
      // React only to `fetchConfig` actions
      .pipe(
        filter(actions.fetchConfig.match),
        switchMap(({ payload: { key, args } }) => {
          const subject = from(provider.getWidgetConfig(key, args))
            // Query the provider for the config, dropping falsy emissions, and share it
            .pipe(
              filter((x) => !!x),
              share(),
            );
          return (
            concat(
              subject
                // Emit an intermediate `setConfig` for every value the query produces
                .pipe(map((manifest) => actions.setConfig(manifest))),
              subject
                // Wait for the final emission and report it as the successful result
                .pipe(
                  last(),
                  map((manifest) => actions.fetchConfig.success(manifest)),
                ),
            )
              // Convert any error from the query/emission chain into a failure action
              .pipe(
                catchError((err) => {
                  return of(actions.fetchConfig.failure(err));
                }),
              )
          );
        }),
      );

/**
 * RxJS flow that reacts to `importWidget` actions by dynamically importing
 * the widget’s JavaScript entry point URL and emitting success or failure.
 *
 * @returns A `Flow` function for the widget state machine.
 */
// Deliberately co-located with the other flow handlers above
// fusion-lint-disable-next-line single-export-per-file
export const handleImportWidget = (): Flow<Actions, WidgetState> => (action$) =>
  action$
    // React only to `importWidget` actions
    .pipe(
      filter(actions.importWidget.match),
      switchMap(({ payload }) => {
        return (
          from(import(/* @vite-ignore */ payload))
            // Dynamically import the widget's script entry point and report success/failure
            .pipe(
              map(actions.importWidget.success),
              catchError((err) => of(actions.importWidget.failure(err))),
            )
        );
      }),
    );
