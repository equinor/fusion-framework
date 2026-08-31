import type { AppEnv } from '@equinor/fusion-framework-app';
import type { Fusion } from '@equinor/fusion-framework';
import {
  mockFramework,
  type FrameworkMockConfigureFn,
  type FrameworkMockConfigurator,
} from '@equinor/fusion-framework/mock';
import { enableAppManifestMock } from '@equinor/fusion-framework-app/mock';
import type { AppModule } from '@equinor/fusion-framework-module-app';
import { enableFeatureFlagMock } from '@equinor/fusion-framework-module-feature-flag/mock';
import { enableNavigation, createHistory } from '@equinor/fusion-framework-module-navigation';
import type { NavigationModule } from '@equinor/fusion-framework-module-navigation';

import { defaultAppEnv } from './default-app-env';

type AppModuleMockInstaller = (
  configurator: FrameworkMockConfigurator<[AppModule, NavigationModule]>,
) => void;

const APP_MODULE_MOCKS: ReadonlyMap<string, AppModuleMockInstaller> = new Map([
  ['@equinor/fusion-framework-module-feature-flag', enableFeatureFlagMock],
]);

/**
 * Enables parent framework mocks associated with the application's runtime dependencies.
 *
 * @param configurator - Parent framework configurator receiving module mocks.
 * @param runtimeDependencies - Package names declared by the tested application.
 */
function enableAppModuleMocks(
  configurator: FrameworkMockConfigurator<[AppModule, NavigationModule]>,
  runtimeDependencies: ReadonlyArray<string>,
): void {
  // Resolve each app dependency independently so new module mocks only require a registry entry.
  for (const dependency of runtimeDependencies) {
    const installMock = APP_MODULE_MOCKS.get(dependency);
    // Dependencies without a parent mock require no framework-level setup.
    if (installMock) {
      installMock(configurator);
    }
  }
}

/**
 * Resolves the parent Fusion instance backing an application module scope, building a
 * fresh {@link mockFramework} instance with this app's own manifest served when none is
 * given.
 *
 * @template TEnv - The application environment descriptor.
 * @param options - `env` seeds the built-in app manifest mock; navigation defaults to in-memory
 *   history, so tests don't leak URL/history state between runs. `runtimeDependencies` enables
 *   parent module mocks associated with packages declared by the tested app. `configure` runs
 *   afterwards on the same configurator — e.g. call `enableNavigation` to override the history
 *   or register extra modules and service discovery entries. `fusion`, an already-built parent
 *   instance, is reused as-is and skips `configure` entirely.
 * @returns The given `fusion`, or a fresh mocked parent Fusion instance.
 */
export async function resolveFusion<TEnv extends AppEnv = AppEnv>(options?: {
  env?: TEnv;
  fusion?: Fusion;
  configure?: FrameworkMockConfigureFn<[AppModule, NavigationModule]>;
  runtimeDependencies?: ReadonlyArray<string>;
}): Promise<Fusion> {
  const { env, fusion, configure, runtimeDependencies = [] } = options ?? {};
  return (
    fusion ??
    mockFramework<[AppModule, NavigationModule]>(async (configurator) => {
      enableAppManifestMock(configurator, env ?? (defaultAppEnv as TEnv));
      enableNavigation(configurator, {
        configure: (config) => config.setHistory(createHistory('memory')),
      });
      enableAppModuleMocks(configurator, runtimeDependencies);
      await configure?.(configurator);
    })
  );
}
