import { testApp as baseTestApp } from './test-app';

// resolved at test-time by `ffc app test`'s Vite plugin (@equinor/fusion-framework-cli/testing);
// see virtual-modules.d.ts for the ambient module declarations
import { manifest, config } from 'virtual:fusion-app-test-env';
import { configure } from 'virtual:fusion-app-test-configure';

/**
 * `vitest`'s `test`, pre-seeded with the application's own manifest, config, and
 * module-configurator, resolved by `ffc app test` the same way `ffc app build`/`ffc app dev`
 * resolve them.
 *
 * @remarks
 * Only works when the test file is run via `ffc app test` (see
 * `@equinor/fusion-framework-cli/testing`'s `appTestVitePlugin`), which registers the virtual
 * modules backing this fixture. Running the same test file through a plain `vitest` invocation
 * that doesn't register the plugin fails to resolve those imports.
 *
 * Per-test mocking still works exactly like the base `testApp`: `.extend('configure', ...)` or
 * a per-case `test.override('env', ...)` layers on top of the resolved values.
 *
 * @example
 * ```tsx
 * import { test } from '@equinor/fusion-framework-react-app/vitest';
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
