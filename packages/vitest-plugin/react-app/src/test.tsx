import { testApp as baseTestApp } from './test-app';

// resolved at test-time by `appTestVitePlugin` (@equinor/fusion-framework-vitest-plugin-react-app);
// see virtual-modules.d.ts for the ambient module declarations
import { manifest, config } from 'virtual:fusion-app-test-env';
import { configure } from 'virtual:fusion-app-test-configure';

/**
 * `vitest`'s `test`, pre-seeded with the application's own manifest, config, and
 * module-configurator, resolved the same way `ffc app build`/`ffc app dev` resolve them.
 *
 * @remarks
 * Requires `appTestVitePlugin` (`@equinor/fusion-framework-vitest-plugin-react-app`) registered in
 * your `vitest.config.ts` `plugins`, which serves the virtual modules backing this fixture.
 * Running the same test file without the plugin registered fails to resolve those imports.
 *
 * Per-test mocking still works exactly like the base `testApp`: `.extend('configure', ...)` or
 * a per-case `test.override('env', ...)` layers on top of the resolved values.
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
  .extend('env', { injected: true }, { manifest, config })
  .extend('configure', { injected: true }, () => configure);

export default test;
