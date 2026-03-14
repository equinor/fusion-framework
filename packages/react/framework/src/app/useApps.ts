import type { AppManifest } from '@equinor/fusion-framework-module-app';
import { useObservableState } from '@equinor/fusion-observable/react';
import { useMemo } from 'react';

import { useAppProvider } from './useAppProvider';

type UseAppsArgs = {
  /** @deprecated - no longer available */
  includeHidden?: boolean;
  // only show apps that the current user has access to
  filterByCurrentUser?: boolean;
};

/**
 * React hook that retrieves available application manifests from the framework.
 *
 * @param args - Optional filtering options.
 * @param args.filterByCurrentUser - When `true`, only apps accessible to the
 *   current user are returned.
 * @returns An object containing:
 *   - `apps` — Array of {@link AppManifest} objects, or `undefined` while loading.
 *   - `isLoading` — `true` until the observable completes.
 *   - `error` — Any error emitted by the underlying observable.
 *
 * @example
 * ```tsx
 * const { apps, isLoading, error } = useApps({ filterByCurrentUser: true });
 * if (isLoading) return <Spinner />;
 * return <AppList apps={apps} />;
 * ```
 *
 * @since 7.1.1
 */
export const useApps = (
  args?: UseAppsArgs,
): { apps: AppManifest[] | undefined; isLoading: boolean; error: unknown } => {
  const provider = useAppProvider();

  const { filterByCurrentUser } = args || {};

  const {
    value: apps,
    complete,
    error,
  } = useObservableState(
    useMemo(
      () => provider.getAppManifests(filterByCurrentUser ? { filterByCurrentUser } : undefined),
      [provider, filterByCurrentUser],
    ),
  );

  return { apps: apps as AppManifest[] | undefined, isLoading: !complete, error };
};

export default useApps;
