import { EMPTY, combineLatestWith, map, of, switchMap } from 'rxjs';

import type { AppModulesInstance } from '@equinor/fusion-framework-module-app';
import type { ContextModule } from '@equinor/fusion-framework-module-context';

import type { SourceFactory, SourceFactoryDeps, ContextNavigationSourceEmission } from '../types';

/**
 * Context-first source factory — for portals where the user picks a
 * context first and the app combo follows.
 *
 * `context.currentContext$` is primary, `app.current$` is secondary.
 * This is the shape used by context-portal — the user selects a context,
 * and the navigation pipeline waits for the corresponding app to load.
 *
 * Includes `validateContext()` filtering when the app provides its own
 * context provider, to ensure the context is valid for the loaded app.
 *
 * @returns A factory that produces `Observable<ContextNavigationSourceEmission>`.
 *
 * @example
 * ```ts
 * import { createContextFirstSource } from '@equinor/fusion-framework-module-context-navigation/sources';
 * builder.setSourceFactory(createContextFirstSource());
 * ```
 */
export function createContextFirstSource(): SourceFactory {
  return (deps: SourceFactoryDeps) => {
    return deps.context.currentContext$.pipe(
      combineLatestWith(
        deps.app.current$.pipe(
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
        ),
      ),
      map(
        ([context, { appModules, appKey }]) =>
          ({ appModules, appKey, context }) satisfies ContextNavigationSourceEmission,
      ),
    );
  };
}
