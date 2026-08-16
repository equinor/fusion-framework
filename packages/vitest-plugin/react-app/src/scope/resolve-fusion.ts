import type { AppEnv } from '@equinor/fusion-framework-app';
import type { Fusion } from '@equinor/fusion-framework';
import { mockFramework } from '@equinor/fusion-framework/mock';
import { enableAppManifestMock } from '@equinor/fusion-framework-app/mock';
import type { AppModule } from '@equinor/fusion-framework-module-app';

import { defaultAppEnv } from './default-app-env';

/**
 * Resolves the parent Fusion instance backing an application module scope, building a
 * fresh {@link mockFramework} instance with this app's own manifest served when none is
 * given.
 *
 * @template TEnv - The application environment descriptor.
 * @param env - The application environment; defaults to {@link defaultAppEnv}.
 * @param fusion - An already-built parent Fusion instance to reuse instead.
 * @returns The given `fusion`, or a fresh mocked parent Fusion instance.
 */
export async function resolveFusion<TEnv extends AppEnv = AppEnv>(
  env?: TEnv,
  fusion?: Fusion,
): Promise<Fusion> {
  return (
    fusion ??
    mockFramework<[AppModule]>((configurator) =>
      enableAppManifestMock(configurator, env ?? (defaultAppEnv as TEnv)),
    )
  );
}
