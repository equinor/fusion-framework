import { test as baseTest } from '@equinor/fusion-framework-vitest-plugin-react-app/test';
import { createOpenApiMockMiddleware } from '@equinor/fusion-framework-module-http/mock';
import type { AppMockConfigureFn } from '@equinor/fusion-framework-app/mock';
import { apiMock } from '../mocks/api-mock';

/**
 * `test`, extended so every client the app's `http` module creates is answered by
 * {@link ../mocks/api-mock.ts}'s seeded OpenAPI mock, on top of the app's real `src/config.ts`
 * — so a `clientLoader` reaches its route component with realistic data instead of the
 * router's error boundary, without the app needing to branch on whether it's under test.
 *
 * @example
 * ```tsx
 * import { testWithApiMock } from '../__tests__/test-with-api-mock';
 * import App from '../App';
 *
 * testWithApiMock('renders the loaded product catalogue', async ({ render, app }) => {
 *   window.history.pushState(null, '', '/');
 *   const { getByTitle, getByText, unmount } = await render(<App />);
 *   await getByTitle('Products').click();
 *   await expect.element(getByText(/showing \d+ of \d+ products/i)).toBeInTheDocument();
 *   await unmount();
 * });
 * ```
 */
export const testWithApiMock = baseTest.extend('configure', ({ configure }) => {
  const withApiMock: AppMockConfigureFn = (configurator, args) => {
    configure?.(configurator, args);
    configurator.http.addMiddleware(createOpenApiMockMiddleware(apiMock));
  };
  return withApiMock;
});

export default testWithApiMock;
