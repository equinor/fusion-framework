import { testApp as baseTestApp } from './test-app';

// resolved at test-time by `appTestVitePlugin` (@equinor/fusion-framework-vitest-plugin-react-app);
// see virtual-modules.d.ts for the ambient module declarations
import { manifest, config } from 'virtual:fusion-app-test-env';
import { configure as configureApp } from 'virtual:fusion-app-test-configure';

/**
 * `vitest`'s `test`, pre-seeded with the application's own manifest, config, and
 * module-configurator, resolved the same way `ffc app build`/`ffc app dev` resolve them.
 *
 * @remarks
 * Requires `appTestVitePlugin` (`@equinor/fusion-framework-vitest-plugin-react-app`) registered in
 * your `vitest.config.ts` `plugins`, which serves the virtual modules backing this fixture.
 * Running the same test file without the plugin registered fails to resolve those imports.
 *
 * Per-test mocking still works exactly like the base `testApp`: `.extend('configureApp', ...)` or
 * a per-case `test.override('appEnv', ...)` layers on top of the resolved values.
 *
 * @remarks `.override('configureApp', ...)` replaces the app's real `configure`
 * This fixture's default value *is* the app's real `src/config.ts` `configure` export.
 * `.override('configureApp', ...)` replaces that default outright, so an override that doesn't
 * itself call the real `configure(configurator, args)` skips the app's production module setup
 * entirely, rather than composing with it. See [Advanced usage](../docs/advanced.md) for the
 * compose-safely pattern.
 *
 * @example
 * ```tsx
 * import { test } from '@equinor/fusion-framework-vitest-plugin-react-app/test';
 * import { App } from '../App';
 *
 * test('renders the app', async ({ render }) => {
 *   const screen = await render(<App />);
 *   await expect.element(screen.getByRole('heading')).toBeVisible();
 * });
 * ```
 */
export const test = baseTestApp
  .extend('appEnv', { injected: true }, { manifest, config })
  .extend('configureApp', { injected: true }, () => configureApp);

export default test;
