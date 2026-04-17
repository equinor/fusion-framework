import { EMPTY, combineLatestWith, distinctUntilChanged, of, switchMap } from 'rxjs';

import type { AppModulesInstance } from '@equinor/fusion-framework-module-app';
import type { ContextModule } from '@equinor/fusion-framework-module-context';

import type { SourceFactory, SourceFactoryDeps, ContextNavigationSourceEmission } from '../types';

/**
 * Default source factory — app-first observable shape.
 *
 * `app.current$` is primary. Each time the loaded app changes, the factory
 * waits for `instance$` (modules initialized), then combines with the
 * portal's `currentContext$`. This is the shape used by app-portal and
 * dev-portal — context is `undefined` until the context module initializes,
 * and the pipeline skips `undefined`.
 *
 * @returns A factory that produces `Observable<ContextNavigationSourceEmission>`.
 *
 * @example
 * ```ts
 * builder.setSourceFactory(createAppFirstSource());
 * ```
 */
export function createAppFirstSource(): SourceFactory {
  return (deps: SourceFactoryDeps) => {
    return deps.app.current$.pipe(
      switchMap((currentApp) => {
        if (!currentApp) return EMPTY;
        return currentApp.instance$.pipe(
          switchMap((appModules) => {
            if (!appModules) return EMPTY;
            return of({
              appModules: appModules as AppModulesInstance<[ContextModule]>,
              appKey: currentApp.appKey,
            });
          }),
        );
      }),
      combineLatestWith(
        deps.context.currentContext$.pipe(
          distinctUntilChanged((a, b) => {
            if (a && b) return a.id === b.id;
            return a === b;
          }),
        ),
      ),
      switchMap(([{ appModules, appKey }, context]) =>
        of({ appModules, appKey, context } satisfies ContextNavigationSourceEmission),
      ),
    );
  };
}
