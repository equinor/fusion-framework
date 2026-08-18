import type { ReactElement } from 'react';
import { test as baseTest } from 'vitest';
import { render, renderHook } from 'vitest-browser-react';
import type { RenderOptions, RenderHookOptions } from 'vitest-browser-react';

import { mockAppModules } from '@equinor/fusion-framework-app/mock';
import type { AppMockConfigureFn } from '@equinor/fusion-framework-app/mock';
import type { AppEnv } from '@equinor/fusion-framework-app';
import type { AppModule } from '@equinor/fusion-framework-module-app';
import type { NavigationModule } from '@equinor/fusion-framework-module-navigation';
import type { FrameworkMockConfigureFn } from '@equinor/fusion-framework/mock';

import { defaultAppEnv, resolveFusion, createAppScopeWrapper } from './scope';

/**
 * `vitest`'s `test`, extended with an application module scope fixture.
 *
 * @remarks
 * An alternative to {@link renderAppComponent}/{@link renderAppHook} for a test file whose
 * cases share seeded fixture defaults: `appEnv`/`configureApp` become suite-level concerns,
 * overridden once per file (or per `describe` block) with `testApp.extend(...)`, rather than
 * an options object repeated on every call. `fusion`/`app` are still instantiated fresh per
 * test — only the seeded defaults are shared, not state between tests. They also resolve
 * lazily: a test that only destructures `app` never pays for rendering anything, and one
 * that only destructures `render`/`renderHook` gets the same fixture wiring automatically.
 *
 * Both entry points stay supported: reach for `renderAppComponent`/`renderAppHook` for a
 * one-off test whose configuration is not shared by the rest of the file; reach for
 * `testApp` when several cases in a file share one set of seeded fixture defaults.
 *
 * @remarks `configureApp`/`configureFusion` default to `undefined` here
 * Unlike `@equinor/fusion-framework-vitest-plugin-react-app/test`'s `test`, this `testApp` does
 * not resolve the app's real `src/config.ts` — it requires `appTestVitePlugin`'s Vite virtual
 * modules to load that file as live code, which `testApp` (no Vite dependency) cannot do. Extend
 * `test` from `/test` instead when a suite needs to compose with the app's real configuration.
 *
 * @remarks Overriding `fusion` bypasses `configureFusion`
 * `fusion` and `configureFusion` are not independent: `fusion`'s default resolver is what
 * calls `configureFusion`. `.override('fusion', ...)` replaces that resolver outright, so a
 * `configureFusion` override on the same test/suite is silently never called. Use
 * `configureFusion` to extend the base framework mock; use `fusion` only to replace it
 * entirely (e.g. with a fully custom or non-mocked instance).
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
 *   const test = testApp.extend('configureApp', { injected: true }, () =>
 *     (configurator) => enableContextMock(configurator, (mock) => mock.setCurrentContext(projectA)),
 *   );
 *
 *   test('starts on the seeded context', async ({ render }) => {
 *     const screen = await render(<App />);
 *     await expect.element(screen.getByText(projectA.title)).toBeVisible();
 *   });
 * });
 * ```
 *
 * @example Extend the parent framework mock with an application module
 * ```tsx
 * const test = testApp.extend('configureFusion', { injected: true }, () =>
 *   (configurator) => {
 *     enableFeatureFlagMock(configurator);
 *     configurator.serviceDiscovery.addServices([
 *       { key: 'people', uri: baseUrl('people') },
 *       { key: 'context', uri: baseUrl('context') },
 *     ]);
 *   },
 * );
 * ```
 */
export const testApp = baseTest
  .extend('appEnv', { injected: true }, defaultAppEnv)
  // `test.extend`'s plain-`value` overload rejects function types (ambiguous with the
  // resolver-`fn` overload), so a function-typed fixture default must go through `fn` instead.
  .extend('configureApp', { injected: true }, () => undefined as AppMockConfigureFn | undefined)
  // Runs after the built-in app manifest/navigation setup, so a test can register extra
  // framework modules, service discovery entries, or call `enableNavigation` again to
  // override the history, without reimplementing the base setup.
  .extend(
    'configureFusion',
    { injected: true },
    () => undefined as FrameworkMockConfigureFn<[AppModule, NavigationModule]> | undefined,
  )
  // IMPORTANT: `.override('fusion', ...)` replaces this resolver entirely, so `configureFusion`
  // is never called — reach for `configureFusion` to extend the base mock, `fusion` only to
  // replace it outright (e.g. with a fully custom or non-mocked instance).
  .extend('fusion', async ({ appEnv, configureFusion }) =>
    resolveFusion({ env: appEnv, configure: configureFusion }),
  )
  .extend('app', async ({ configureApp, appEnv, fusion }) =>
    mockAppModules<unknown, AppEnv>(configureApp, appEnv as AppEnv, fusion),
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
