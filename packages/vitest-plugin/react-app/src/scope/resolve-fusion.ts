import type { AppEnv } from '@equinor/fusion-framework-app';
import type { Fusion } from '@equinor/fusion-framework';
import { mockFramework, type FrameworkMockConfigureFn } from '@equinor/fusion-framework/mock';
import { enableAppManifestMock } from '@equinor/fusion-framework-app/mock';
import type { AppModule } from '@equinor/fusion-framework-module-app';
import { enableNavigation, createHistory } from '@equinor/fusion-framework-module-navigation';
import type { NavigationModule } from '@equinor/fusion-framework-module-navigation';
import type { IModulesConfigurator } from '@equinor/fusion-framework-module';

import { defaultAppEnv } from './default-app-env';

/**
 * Enables the feature-flag mock only when `@equinor/fusion-framework-module-feature-flag` — an
 * optional peer dependency — is actually installed, so apps that don't use feature flags aren't
 * forced to install a module they never reference.
 */
// biome-ignore lint/suspicious/noExplicitAny: must accept any configurator shape, mirrors enableFeatureFlagMock's own signature
async function enableFeatureFlagMockIfAvailable(configurator: IModulesConfigurator<any, any>): Promise<void> {
  try {
    const { enableFeatureFlagMock } = await import('@equinor/fusion-framework-module-feature-flag/mock');
    enableFeatureFlagMock(configurator);
  } catch {
    // not installed — nothing to mock
  }
}

/**
 * Resolves the parent Fusion instance backing an application module scope, building a
 * fresh {@link mockFramework} instance with this app's own manifest served when none is
 * given.
 *
 * @template TEnv - The application environment descriptor.
 * @param options - `env` seeds the built-in app manifest mock; navigation defaults to in-memory
 *   history, so tests don't leak URL/history state between runs. Feature flags default to the
 *   in-memory feature-flag mock, with none enabled, when the optional
 *   `@equinor/fusion-framework-module-feature-flag` peer dependency is installed. `configure`
 *   runs afterwards on the same configurator — e.g. call `enableNavigation` or
 *   `enableFeatureFlagMock` again to override either, or register extra modules and service
 *   discovery entries. `fusion`, an already-built parent instance, is reused as-is and skips
 *   `configure` entirely.
 * @returns The given `fusion`, or a fresh mocked parent Fusion instance.
 */
export async function resolveFusion<TEnv extends AppEnv = AppEnv>(options?: {
  env?: TEnv;
  fusion?: Fusion;
  configure?: FrameworkMockConfigureFn<[AppModule, NavigationModule]>;
}): Promise<Fusion> {
  const { env, fusion, configure } = options ?? {};
  return (
    fusion ??
    mockFramework<[AppModule, NavigationModule]>(async (configurator) => {
      enableAppManifestMock(configurator, env ?? (defaultAppEnv as TEnv));
      enableNavigation(configurator, {
        configure: (config) => config.setHistory(createHistory('memory')),
      });
      await enableFeatureFlagMockIfAvailable(configurator);
      await configure?.(configurator);
    })
  );
}
