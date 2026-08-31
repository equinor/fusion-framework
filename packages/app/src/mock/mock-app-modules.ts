import type { Fusion } from '@equinor/fusion-framework';
import { mockFramework } from '@equinor/fusion-framework/mock';

import type { AnyModule } from '@equinor/fusion-framework-module';
import type { AppModule } from '@equinor/fusion-framework-module-app';

import { initializeAppModules } from '../initialize-app-modules.js';
import type { AppEnv, AppModulesInstance } from '../types.js';

import { AppMockConfigurator } from './AppMockConfigurator.js';
import { enableAppManifestMock } from './enable-app-manifest-mock.js';

/**
 * Configuration callback for {@link mockAppModules}.
 */
export type AppMockConfigureFn<
  TModules extends Array<AnyModule> | unknown = unknown,
  TEnv extends AppEnv = AppEnv,
> = (
  configurator: AppMockConfigurator<TModules, Fusion['modules'], TEnv>,
  args: { fusion: Fusion; env: TEnv },
) => void | Promise<void>;

/**
 * Runs an application's module pipeline with no real credentials required,
 * from either the parent framework or the app's own `http`/`msal`
 * registrations.
 *
 * @remarks
 * The real `AppConfigurator` pipeline is run — the real module set, the real
 * configuration pipeline and the real lifecycle. Only the boundaries that
 * would need credentials are substituted by default; the `http` module is
 * the real `HttpClientConfigurator`, so a registered client only avoids the
 * network for requests a middleware short-circuits with a response — a
 * client with no matching middleware, or a middleware that calls `next`,
 * still reaches the real network. A test exercises the wiring an
 * application actually depends on rather than a reimplementation of it.
 *
 * The configurator passed to `cb` is an {@link AppMockConfigurator}, which *is*
 * an `AppConfigurator`. `useFrameworkServiceClient`, `configureHttpClient` and
 * any callback written for a real app work against it unchanged.
 *
 * `fusion` defaults to a fresh {@link mockFramework} instance with a real `app`
 * module already enabled and this app's own manifest served at whatever URI
 * service discovery resolves `'apps'` to, so a test needs no parent Fusion
 * instance of its own — but an already-mocked (or real) instance can be passed
 * to compose with other framework-level setup. To point the parent's service
 * discovery at something else (e.g. a real local mock server) while keeping
 * the manifest served consistently, build that `fusion` with
 * {@link mockFramework} and call {@link enableAppManifestMock} yourself,
 * after customizing `serviceDiscovery`.
 *
 * @template TModules - Module descriptors beyond the default set. Supply this
 *   when a test registers application modules, so they are typed on the result.
 * @template TEnv - The application environment descriptor.
 * @param cb - Configuration callback invoked before module initialization, or `undefined` to skip it.
 * @param env - The application environment (manifest, config, basename).
 * @param fusion - The parent Fusion instance; defaults to a fresh {@link mockFramework} instance.
 * @returns The initialized application module instance.
 *
 * @example Zero configuration
 * ```typescript
 * const manifest = { appKey: 'my-app', displayName: 'My App', description: 'My app', type: 'standalone' } as const;
 * const modules = await mockAppModules(undefined, { manifest });
 * ```
 *
 * @example Register a client answered by the app's own mocked HTTP module
 * ```typescript
 * const manifest = { appKey: 'my-app', displayName: 'My App', description: 'My app', type: 'standalone' } as const;
 * const modules = await mockAppModules(
 *   (configurator) => {
 *     configurator.useFrameworkServiceClient('portal-api');
 *     configurator.http.addMiddleware(async (uri, init, next) =>
 *       uri === 'https://portal-api.fusion.test/items' ? Response.json([{ id: 1 }]) : next(uri, init),
 *     );
 *   },
 *   { manifest },
 * );
 *
 * const items = await modules.http.createClient('portal-api').json('/items');
 * ```
 */
export async function mockAppModules<
  TModules extends Array<AnyModule> | unknown = unknown,
  TEnv extends AppEnv = AppEnv,
>(
  cb: AppMockConfigureFn<TModules, TEnv> | undefined,
  env: TEnv,
  fusion?: Fusion,
): Promise<AppModulesInstance<TModules>> {
  // `await` is illegal in a parameter default, so an omitted fusion is resolved here instead.
  // The default parent also carries a real `app` module, serving this app's own manifest at
  // whatever URI service discovery is currently configured to resolve `'apps'` to, so a test
  // exercises the same portal wiring a real parent framework would provide.
  const resolvedFusion: Fusion =
    fusion ??
    (await mockFramework<[AppModule]>((configurator) => enableAppManifestMock(configurator, env)));
  const configurator = new AppMockConfigurator<TModules, Fusion['modules'], TEnv>(env);
  // Cast is safe: `initializeAppModules` returns the exact module instance produced by
  // `configurator`, which was constructed with this same `TModules`. TypeScript widens
  // `TModules` to its constraint (`AnyModule[]`) when inferring through the generic
  // `TConfigurator` parameter, so the assignment needs an explicit assertion here.
  return initializeAppModules(configurator, cb, {
    fusion: resolvedFusion,
    env,
  }) as Promise<AppModulesInstance<TModules>>;
}

export default mockAppModules;
