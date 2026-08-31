import { mockAppModules } from '@equinor/fusion-framework-app/mock';
import type { AppMockConfigureFn } from '@equinor/fusion-framework-app/mock';
import type { AppEnv, AppModulesInstance } from '@equinor/fusion-framework-app';
import type { Fusion } from '@equinor/fusion-framework';
import type { AnyModule } from '@equinor/fusion-framework-module';

import { resolveFusion } from './resolve-fusion';
import { defaultAppEnv } from './default-app-env';

/**
 * The parent Fusion instance and resolved application module scope shared by every
 * `packages/react/app` testing helper.
 *
 * @template TModules - Module descriptors beyond the default set.
 */
export interface AppScope<TModules extends Array<AnyModule> | unknown = unknown> {
  /** The parent Fusion instance the application scope was resolved against. */
  framework: Fusion;
  /** The resolved application module instance. */
  app: AppModulesInstance<TModules>;
}

/**
 * Resolves the parent Fusion instance and application module scope shared by every
 * `packages/react/app` testing helper.
 *
 * @template TModules - Module descriptors beyond the default set.
 * @template TEnv - The application environment descriptor.
 * @param options - A `configure` callback and `env` for {@link mockAppModules}, plus an
 *   already-built `fusion` instance to reuse instead of a fresh one.
 * @returns The resolved {@link AppScope}.
 */
export async function resolveAppScope<
  TModules extends Array<AnyModule> | unknown = unknown,
  TEnv extends AppEnv = AppEnv,
>(options?: {
  configure?: AppMockConfigureFn<TModules, TEnv>;
  env?: TEnv;
  fusion?: Fusion;
}): Promise<AppScope<TModules>> {
  const { configure, env, fusion: providedFusion } = options ?? {};
  const resolvedEnv = env ?? (defaultAppEnv as TEnv);
  const framework = await resolveFusion({ env: resolvedEnv, fusion: providedFusion });
  const app = await mockAppModules(configure, resolvedEnv, framework);
  return { framework, app };
}
