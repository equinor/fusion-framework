import { expect } from 'vitest';
import { testWithApiMock } from './test-with-api-mock';

import App from '../App';

// Exercises the real `clientLoader` -> `ProductApi`/`UserApi` -> `http` pipeline, answered by
// the seeded OpenAPI mock instead of the router's error boundary (see docs/testing.md).

testWithApiMock('navigates to Products and renders the loaded, seeded catalogue', async ({
  render,
}) => {
  window.history.pushState(null, '', '/');
  const { getByTitle, getByText, unmount } = await render(<App />);

  await getByTitle('Products').click();

  await expect.element(getByText(/showing \d+ of \d+ products/i)).toBeInTheDocument();

  await unmount();
});

testWithApiMock('navigates to a product detail route and renders the loaded product', async ({
  render,
  app,
}) => {
  window.history.pushState(null, '', '/');
  const { getByText, unmount } = await render(<App />);

  app.navigation.navigate('/products/1');

  await expect.element(getByText('← Back to Products')).toBeInTheDocument();

  await unmount();
});

testWithApiMock('navigates to Users and renders the loaded, seeded directory', async ({ render }) => {
  window.history.pushState(null, '', '/');
  const { getByTitle, getByText, unmount } = await render(<App />);

  await getByTitle('Users').click();

  await expect.element(getByText(/showing \d+ of \d+ users \(page \d+ of \d+\)/i)).toBeInTheDocument();

  await unmount();
});
