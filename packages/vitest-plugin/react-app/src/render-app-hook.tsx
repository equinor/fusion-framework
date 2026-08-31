import { renderHook } from 'vitest-browser-react';
import type { RenderHookOptions, RenderHookResult } from 'vitest-browser-react';

import type { AppMockConfigureFn } from '@equinor/fusion-framework-app/mock';
import type { AppEnv, AppModulesInstance } from '@equinor/fusion-framework-app';
import type { Fusion } from '@equinor/fusion-framework';
import type { AnyModule } from '@equinor/fusion-framework-module';

import { resolveAppScope, createAppScopeWrapper } from './scope';

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
 * The result of {@link renderAppHook}: the `vitest-browser-react` `renderHook` result,
 * plus the resolved application module scope and its parent Fusion instance.
 *
 * @template Result - The value returned by the rendered hook.
 * @template Props - The props accepted by the rendered hook.
 * @template TModules - Module descriptors beyond the default set.
 */
export interface RenderAppHookResult<
  Result,
  Props,
  TModules extends Array<AnyModule> | unknown = unknown,
> extends RenderHookResult<Result, Props> {
  /**
   * The Fusion instances backing the rendered hook, nested under this single key so
   * `vitest-browser-react`'s own `RenderHookResult` fields stay free to evolve without
   * ever colliding with it.
   */
  fusion: {
    /** The parent Fusion instance the hook's `FrameworkProvider` was given. */
    framework: Fusion;
    /**
     * The resolved application module instance backing the rendered hook — the same
     * instance a real app would read via `useAppModule`/`useAppModules`. Drive a module
     * not returned by the hook itself (e.g. `fusion.app.context.setCurrentContextByIdAsync(id)`)
     * to exercise a state change after the initial render.
     */
    app: AppModulesInstance<TModules>;
  };
}

/**
 * Renders a hook inside a real, mock-backed application module scope.
 *
 * @remarks
 * Wraps `vitest-browser-react`'s `renderHook` with the same provider nesting
 * `createComponent` uses in production — a `FrameworkProvider` (the parent Fusion
 * instance, from `mockFramework`) around a `ModuleProvider` (this app's own modules,
 * from `mockAppModules`, `@equinor/fusion-framework-app/mock`) — the real
 * `event`/`http`/`msal` module pipeline. Only requests a seeded middleware answers are
 * faked; a request with no matching middleware still reaches the real network. Use this
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
 * @returns The `renderHook` result plus `fusion.framework` and `fusion.app`, once the mocked application module scope resolves.
 *
 * @example
 * ```tsx
 * const { result } = await renderAppHook(() => useAccessToken({ scopes: ['User.Read'] }));
 * await vi.waitFor(() => expect(result.current.pending).toBe(false));
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
  render: (initialProps?: Props) => Result,
  options?: RenderAppHookOptions<TModules, TEnv, Props>,
): Promise<RenderAppHookResult<Result, Props, TModules>> {
  const { configure, env, fusion: providedFusion, ...renderHookOptions } = options ?? {};
  const { framework, app } = await resolveAppScope<TModules, TEnv>({
    configure,
    env,
    fusion: providedFusion,
  });
  const result = await renderHook(render, {
    ...renderHookOptions,
    wrapper: createAppScopeWrapper<TModules>({ framework, app }),
  });
  return { ...result, fusion: { framework, app } };
}

export default renderAppHook;
