import type { ReactElement } from 'react';
import { render } from 'vitest-browser-react';
import type { RenderOptions, RenderResult } from 'vitest-browser-react';

import type { AppMockConfigureFn } from '@equinor/fusion-framework-app/mock';
import type { AppEnv, AppModulesInstance } from '@equinor/fusion-framework-app';
import type { Fusion } from '@equinor/fusion-framework';
import type { AnyModule } from '@equinor/fusion-framework-module';

import { resolveAppScope, createAppScopeWrapper } from './scope';

/**
 * Options for {@link renderAppComponent}.
 *
 * @template TModules - Module descriptors beyond the default set.
 * @template TEnv - The application environment descriptor.
 */
export interface RenderAppComponentOptions<
  TModules extends Array<AnyModule> | unknown = unknown,
  TEnv extends AppEnv = AppEnv,
> extends Omit<RenderOptions, 'wrapper'> {
  /** Configuration callback forwarded to {@link mockAppModules}. */
  configure?: AppMockConfigureFn<TModules, TEnv>;
  /** The application environment; defaults to a generic standalone test app. */
  env?: TEnv;
  /**
   * The parent Fusion instance; defaults to a fresh {@link mockFramework} instance with
   * this app's own manifest served. Pass one built beforehand to reuse a single instance
   * across multiple render calls, or to pre-configure parent-level modules (e.g. `http`,
   * `context`, `serviceDiscovery`, or `app` itself for a component that loads another app).
   */
  fusion?: Fusion;
}

/**
 * The result of {@link renderAppComponent}: the `vitest-browser-react` render result,
 * plus the resolved application module scope and its parent Fusion instance.
 *
 * @template TModules - Module descriptors beyond the default set.
 */
export interface RenderAppComponentResult<TModules extends Array<AnyModule> | unknown = unknown>
  extends RenderResult {
  /**
   * The Fusion instances backing the rendered component, nested under this single key so
   * `vitest-browser-react`'s own `RenderResult` fields stay free to evolve without ever
   * colliding with it.
   */
  fusion: {
    /** The parent Fusion instance the component's `FrameworkProvider` was given. */
    framework: Fusion;
    /**
     * The resolved application module instance backing the rendered component — the same
     * instance a real app would read via `useAppModule`/`useAppModules`. Drive a module
     * directly (e.g. `fusion.app.context.setCurrentContextByIdAsync(id)`) to exercise a
     * state change after the initial render, then assert the component re-rendered accordingly.
     */
    app: AppModulesInstance<TModules>;
  };
}

/**
 * Renders a component inside a real, mock-backed application module scope.
 *
 * @remarks
 * Wraps `vitest-browser-react`'s `render` with the same provider nesting
 * `createComponent` uses in production — a `FrameworkProvider` (the parent Fusion
 * instance, from `mockFramework`) around a `ModuleProvider` (this app's own modules,
 * from `mockAppModules`, `@equinor/fusion-framework-app/mock`). See {@link renderAppHook}
 * for the equivalent helper when testing a hook in isolation, rather than a component.
 *
 * @template TModules - Module descriptors beyond the default set.
 * @template TEnv - The application environment descriptor.
 * @param ui - The component to render.
 * @param options - A `configure` callback and `env` for `mockAppModules`, plus any other `render` option.
 * @returns The `render` result plus `fusion.framework` and `fusion.app`, once the mocked application module scope resolves.
 *
 * @example
 * ```tsx
 * const { getByText } = await renderAppComponent(<Apploader appKey="child-app" />, {
 *   fusion: await mockFramework<[AppModule]>((configurator) => {
 *     // register the child app's own manifest against the `app` module
 *   }),
 * });
 * await expect.element(getByText(/mounted/)).toBeInTheDocument();
 * ```
 *
 * @example Drive a module directly and assert the re-render
 * ```tsx
 * const { getByText, fusion } = await renderAppComponent<[ContextModule]>(<App />, {
 *   configure: (configurator) => enableContextMock(configurator, (mock) => mock.setCurrentContext(projectA)),
 * });
 * await fusion.app.context.setCurrentContextByIdAsync(projectB.id);
 * await expect.element(getByText(/project-b/)).toBeInTheDocument();
 * ```
 */
export async function renderAppComponent<
  TModules extends Array<AnyModule> | unknown = unknown,
  TEnv extends AppEnv = AppEnv,
>(
  ui: ReactElement,
  options?: RenderAppComponentOptions<TModules, TEnv>,
): Promise<RenderAppComponentResult<TModules>> {
  const { configure, env, fusion: providedFusion, ...renderOptions } = options ?? {};
  const { framework, app } = await resolveAppScope<TModules, TEnv>({
    configure,
    env,
    fusion: providedFusion,
  });
  const result = await render(ui, {
    ...renderOptions,
    wrapper: createAppScopeWrapper<TModules>({ framework, app }),
  });
  return { ...result, fusion: { framework, app } };
}

export default renderAppComponent;
