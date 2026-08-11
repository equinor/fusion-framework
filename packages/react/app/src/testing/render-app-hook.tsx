import { renderHook } from '@testing-library/react';
import type { RenderHookOptions, RenderHookResult } from '@testing-library/react';

import { mockAppModules, enableAppManifestMock } from '@equinor/fusion-framework-app/mock';
import type { AppMockConfigureFn } from '@equinor/fusion-framework-app/mock';
import type { AppEnv } from '@equinor/fusion-framework-app';
import type { Fusion } from '@equinor/fusion-framework';
import { mockFramework } from '@equinor/fusion-framework/mock';
import type { AnyModule } from '@equinor/fusion-framework-module';
import type { AppModule } from '@equinor/fusion-framework-module-app';
import { FrameworkProvider } from '@equinor/fusion-framework-react';
import { ModuleProvider } from '@equinor/fusion-framework-react-module';

/** Manifest used when a test does not care about its own app identity. */
const defaultManifest: AppEnv['manifest'] = {
  appKey: 'test-app',
  displayName: 'Test App',
  description: 'A test application',
  type: 'standalone',
};

/**
 * Options for {@link renderAppHook}.
 *
 * @template TModules - Module descriptors beyond the default set.
 * @template TEnv - The application environment descriptor.
 * @template Props - The props type accepted by the rendered hook.
 */
export interface RenderAppHookOptions<
  TModules extends Array<AnyModule> | unknown = unknown,
  TEnv extends AppEnv = AppEnv,
  Props = undefined,
> extends Omit<RenderHookOptions<Props>, 'wrapper'> {
  /** Configuration callback forwarded to {@link mockAppModules}. */
  configure?: AppMockConfigureFn<TModules, TEnv>;
  /** The application environment; defaults to a generic standalone test app. */
  env?: TEnv;
  /**
   * The parent Fusion instance; defaults to a fresh {@link mockFramework} instance with
   * this app's own manifest served. Pass one built beforehand to reuse a single instance
   * across multiple `renderAppHook` calls, or to pre-configure parent-level modules (e.g.
   * `http`, `context`, `serviceDiscovery`) the app reads through `useFramework`.
   */
  fusion?: Fusion;
}

/**
 * Renders a hook inside a real, mock-backed application module scope.
 *
 * @remarks
 * Wraps `@testing-library/react`'s `renderHook` with the same provider nesting
 * `createComponent` uses in production — a `FrameworkProvider` (the parent Fusion
 * instance, from `mockFramework`) around a `ModuleProvider` (this app's own modules,
 * from `mockAppModules`, `@equinor/fusion-framework-app/mock`) — the real
 * `event`/`http`/`msal` module pipeline, with only the network boundary faked. Use this
 * for any hook that reads from the application module scope or the parent framework
 * (e.g. `useAppModule`, `useAccessToken`, `useFramework`), instead of hand-wiring
 * `mockFramework`, `mockAppModules`, `FrameworkProvider` and `ModuleProvider` in every test.
 *
 * @template Result - The value returned by the rendered hook.
 * @template Props - The props accepted by the rendered hook.
 * @template TModules - Module descriptors beyond the default set.
 * @template TEnv - The application environment descriptor.
 * @param render - The hook to render, receiving `initialProps`.
 * @param options - A `configure` callback and `env` for `mockAppModules`, plus any other
 *   `renderHook` option.
 * @returns The `renderHook` result, once the mocked application module scope resolves.
 *
 * @example
 * ```tsx
 * const { result } = await renderAppHook(() => useAccessToken({ scopes: ['User.Read'] }));
 * await waitFor(() => expect(result.current.pending).toBe(false));
 * ```
 *
 * @example Sign in a named user
 * ```tsx
 * const { result } = await renderAppHook(() => useCurrentAccount(), {
 *   configure: (configurator) => configurator.msal.setAccount({ name: 'Ada Lovelace' }),
 * });
 * ```
 *
 * @example Reuse a pre-built parent Fusion instance
 * ```tsx
 * const fusion = await mockFramework<[AppModule]>((configurator) =>
 *   enableAppManifestMock(configurator, env),
 * );
 *
 * const { result: a } = await renderAppHook(() => useAccessToken({ scopes: ['User.Read'] }), { fusion });
 * const { result: b } = await renderAppHook(() => useCurrentAccount(), { fusion });
 * ```
 */
export async function renderAppHook<
  Result,
  Props = undefined,
  TModules extends Array<AnyModule> | unknown = unknown,
  TEnv extends AppEnv = AppEnv,
>(
  render: (initialProps: Props) => Result,
  options?: RenderAppHookOptions<TModules, TEnv, Props>,
): Promise<RenderHookResult<Result, Props>> {
  const { configure, env, fusion: providedFusion, ...renderHookOptions } = options ?? {};
  const resolvedEnv = env ?? ({ manifest: defaultManifest } as TEnv);
  // Built explicitly (rather than left to `mockAppModules`'s own default) so the same
  // instance can also be handed to `FrameworkProvider` below — mirroring `createComponent`'s
  // `enableAppManifestMock` + `mockAppModules(cb, env, fusion)` composition.
  const fusion =
    providedFusion ??
    (await mockFramework<[AppModule]>((configurator) =>
      enableAppManifestMock(configurator, resolvedEnv),
    ));
  const modules = await mockAppModules(configure, resolvedEnv, fusion);
  return renderHook(render, {
    ...renderHookOptions,
    wrapper: ({ children }) => (
      <FrameworkProvider value={fusion}>
        <ModuleProvider value={modules}>{children}</ModuleProvider>
      </FrameworkProvider>
    ),
  });
}

export default renderAppHook;
