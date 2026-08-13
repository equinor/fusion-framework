import type { ReactElement } from 'react';
import { test as baseTest } from 'vitest';
import { render, renderHook } from 'vitest-browser-react';
import type { RenderOptions, RenderHookOptions } from 'vitest-browser-react';

import { mockAppModules } from '@equinor/fusion-framework-app/mock';
import type { AppMockConfigureFn } from '@equinor/fusion-framework-app/mock';
import type { AppEnv } from '@equinor/fusion-framework-app';

import { defaultAppEnv, resolveFusion, createAppScopeWrapper } from './scope';

/**
 * `vitest`'s `test`, extended with an application module scope fixture.
 *
 * @remarks
 * An alternative to {@link renderAppComponent}/{@link renderAppHook} for a test file whose
 * cases share one mocked scope: `env`/`configure` become suite-level concerns, overridden
 * once per file (or per `describe` block) with `testApp.extend(...)`, rather than an
 * options object repeated on every call. `fusion`/`app` resolve lazily — a test that only
 * destructures `app` never pays for rendering anything, and one that only destructures
 * `render`/`renderHook` gets the same mocked scope wired in automatically.
 *
 * Both entry points stay supported: reach for `renderAppComponent`/`renderAppHook` for a
 * one-off test whose configuration is not shared by the rest of the file; reach for
 * `testApp` when several cases in a file share one seeded scope.
 *
 * @example
 * ```tsx
 * testApp('resolves current context', async ({ app, render }) => {
 *   const screen = await render(<App />);
 *   expect(app.context).toBeDefined();
 * });
 * ```
 *
 * @example Seed a module for every test in a suite
 * ```tsx
 * describe('with a seeded context module', () => {
 *   const test = testApp.extend('configure', { injected: true }, () =>
 *     (configurator) => enableContextMock(configurator, (mock) => mock.setCurrentContext(projectA)),
 *   );
 *
 *   test('starts on the seeded context', async ({ render }) => {
 *     const screen = await render(<App />);
 *     await expect.element(screen.getByText(projectA.title)).toBeVisible();
 *   });
 * });
 * ```
 */
export const testApp = baseTest
  .extend('env', { injected: true }, defaultAppEnv)
  // `test.extend`'s plain-`value` overload rejects function types (ambiguous with the
  // resolver-`fn` overload), so a function-typed fixture default must go through `fn` instead.
  .extend('configure', { injected: true }, () => undefined as AppMockConfigureFn | undefined)
  .extend('fusion', async ({ env }) => resolveFusion(env))
  .extend('app', async ({ configure, env, fusion }) =>
    mockAppModules<unknown, AppEnv>(configure, env as AppEnv, fusion),
  )
  .extend('render', ({ fusion, app }) => {
    const wrapper = createAppScopeWrapper({ framework: fusion, app });
    return (ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) =>
      render(ui, { ...options, wrapper });
  })
  .extend('renderHook', ({ fusion, app }) => {
    const wrapper = createAppScopeWrapper({ framework: fusion, app });
    return <Result, Props = undefined>(
      cb: (initialProps?: Props) => Result,
      options?: Omit<RenderHookOptions<Props>, 'wrapper'>,
    ) => renderHook(cb, { ...options, wrapper });
  });

export default testApp;
