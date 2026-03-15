import type { FusionModulesInstance } from '@equinor/fusion-framework';
import type { AppModule } from '@equinor/fusion-framework-module-app';

import { useFramework } from '../useFramework';

/**
 * React hook that returns the App module provider from the framework.
 *
 * @returns The app module instance (`AppModule`) for querying and managing
 *   application manifests and the currently active app.
 * @throws {Error} If the `AppModule` is not configured in the framework.
 *
 * @example
 * ```ts
 * const provider = useAppProvider();
 * provider.getAppManifests().subscribe(console.log);
 * ```
 */
export const useAppProvider = (): FusionModulesInstance<[AppModule]>['app'] => {
  const provider = useFramework<[AppModule]>().modules.app;
  if (!provider) {
    throw Error('Current framework does not have AppModule configured');
  }

  return provider;
};

export default useAppProvider;
