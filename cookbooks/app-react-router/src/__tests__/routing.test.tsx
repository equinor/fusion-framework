import { expect } from 'vitest';
import { test } from '@equinor/fusion-framework-vitest-plugin-react-app/test';

import App from '../App';

// Exercises the routes.ts DSL end to end: layout()/index() wiring the default route, and
// prefix()/route() composing a nested path that's navigated to via the sidebar.

test('renders the default index route under the root layout', async ({ render }) => {
  const { getByRole, unmount } = await render(<App />);

  await expect
    .element(getByRole('heading', { name: /cookbook - react router app/i }))
    .toBeInTheDocument();

  await unmount();
});

test('navigates to a route nested under prefix() and renders it', async ({ render }) => {
  const { getByText, getByRole, unmount } = await render(<App />);

  await getByText('Error Test').click();

  // error-test's loader always throws, so the router's error boundary is what renders here,
  // not the route's default-exported component.
  await expect.element(getByRole('heading', { name: /error encountered/i })).toBeInTheDocument();
  await expect
    .element(getByText(/this is a test error to demonstrate error boundaries/i).first())
    .toBeInTheDocument();

  await unmount();
});

test('navigation module navigates the app to a new route', async ({ render, app }) => {
  const { getByRole, unmount } = await render(<App />);

  expect(app.navigation.path.pathname).toBe('/');

  app.navigation.navigate('/pages/error-test');

  // error-test's loader always throws, so the router's error boundary is what renders here,
  // not the route's default-exported component.
  await expect.element(getByRole('heading', { name: /error encountered/i })).toBeInTheDocument();
  expect(app.navigation.path.pathname).toBe('/pages/error-test');

  await unmount();
});
