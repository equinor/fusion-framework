import type { ReactElement } from 'react';
import { test as baseTest } from '@equinor/fusion-framework-vitest-plugin-react-app/test';
import { Router } from '@equinor/fusion-framework-react-router';
import type { RouteObject } from '@equinor/fusion-framework-react-router';

/**
 * `test`, extended so `render` mounts the given element under a mock `Router` instead of
 * rendering it directly — giving components that call `useNavigate`/`useLocation`/`Link`/
 * `Form`/`useSubmit`/etc. real router context without needing the app's full route tree or
 * the file-route DSL.
 *
 * @remarks
 * The mock route matches every path (`path: '*'`), so the rendered component stays mounted
 * across in-test navigations instead of being replaced by a "no match" boundary.
 *
 * @example
 * ```tsx
 * import { testWithRouter } from '../__tests__/test-with-router';
 * import { Navigation } from './Navigation';
 *
 * testWithRouter('renders a sidebar link for each top-level page', async ({ render }) => {
 *   const { getByText } = await render(<Navigation />);
 *   await expect.element(getByText('Home')).toBeInTheDocument();
 * });
 * ```
 */
export const testWithRouter = baseTest.extend('render', ({ render }) => {
  return (ui: ReactElement) => {
    const routes: RouteObject[] = [{ path: '*', Component: () => ui }];
    return render(<Router routes={routes} />);
  };
});

export default testWithRouter;
