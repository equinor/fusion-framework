import { test as baseTest } from '@equinor/fusion-framework-vitest-plugin-react-app/test';
import { mockAppModules } from '@equinor/fusion-framework-app/mock';
import type { AppEnv } from '@equinor/fusion-framework-app';
import type { NavigationModule } from '@equinor/fusion-framework-module-navigation';

/**
 * `test`, with the `app` fixture typed to include the navigation module, so tests can drive
 * and assert routing through `app.navigation` without casting.
 *
 * @remarks
 * The base fixture types `app` as `AppModulesInstance<unknown>`. The navigation module is
 * already registered at runtime, so re-extending `app` with the same resolver only narrows
 * its type. Extend this fixture (not the plugin's `test`) so derived fixtures keep the type.
 *
 * @example
 * ```tsx
 * import { test } from '../__tests__/test-app';
 * import App from '../App';
 *
 * test('navigates to a route', async ({ render, app }) => {
 *   await render(<App />);
 *   app.navigation.navigate('/products');
 *   expect(app.navigation.path.pathname).toBe('/products');
 * });
 * ```
 */
export const test = baseTest.extend('app', ({ configureApp, appEnv, fusion }) =>
  mockAppModules<[NavigationModule], AppEnv>(configureApp, appEnv as AppEnv, fusion),
);

export default test;
