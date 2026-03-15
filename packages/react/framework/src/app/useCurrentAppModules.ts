import { useMemo } from 'react';
import useCurrentApp from './useCurrentApp';

import type { AppModulesInstance } from '@equinor/fusion-framework-module-app';
import { type Observable, of } from 'rxjs';
import type { AnyModule } from '@equinor/fusion-framework-module';
import { useObservableState } from '@equinor/fusion-observable/react';

/**
 * React hook that observes the initialised modules of the current application.
 *
 * @remarks
 * Subscribes to the `instance$` stream of the current app and returns the
 * resolved module instances.
 *
 * **Warning:** The template parameter is a compile-time hint only — the
 * hook does not validate that the specified modules are actually enabled.
 *
 * @template TModules - Tuple of module types expected on the current app
 *   (type-hint only).
 * @returns An object containing:
 *   - `modules` — The initialised {@link AppModulesInstance}, `null` when no
 *     app is selected, or `undefined` while loading.
 *   - `error` — Any error emitted during initialisation.
 *   - `complete` — `true` when the observable has completed.
 */
export const useCurrentAppModules = <TModules extends Array<AnyModule> = []>(): {
  modules?: AppModulesInstance<TModules> | null;
  error?: unknown;
  complete: boolean;
} => {
  const { currentApp, error: appError } = useCurrentApp<TModules>();
  const modules$ = useMemo(
    () =>
      currentApp ? (currentApp.instance$ as Observable<AppModulesInstance<TModules>>) : of(null),
    [currentApp],
  );
  const {
    value: modules,
    error,
    complete,
  } = useObservableState(modules$, {
    initial: currentApp === undefined ? undefined : (currentApp?.instance ?? null),
  });
  return {
    modules,
    error: error ?? appError,
    complete,
  };
};

export default useCurrentAppModules;
