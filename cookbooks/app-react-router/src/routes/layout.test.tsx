import { expect } from 'vitest';
import { test } from '@equinor/fusion-framework-vitest-plugin-react-app/test';
import { Router } from '@equinor/fusion-framework-react-router';
import type { RouteObject } from '@equinor/fusion-framework-react-router';

import Layout from './layout';

test('renders the header, sidebar navigation, and the matched child route content', async ({
  render,
}) => {
  const routes: RouteObject[] = [
    {
      path: '/',
      Component: Layout,
      children: [{ index: true, Component: () => <div>Home content</div> }],
    },
  ];

  const { getByRole, getByTitle, getByText, unmount } = await render(<Router routes={routes} />);

  await expect
    .element(getByRole('heading', { name: /cookbook - react router app/i }))
    .toBeInTheDocument();
  await expect.element(getByTitle('Home')).toBeInTheDocument();
  await expect.element(getByText('Home content')).toBeInTheDocument();

  await unmount();
});

test('renders the loader while a navigation is pending, then the outlet once it settles', async ({
  render,
  app,
}) => {
  // held open until the assertion below has observed the loading state
  let resolveLoader = (_value?: unknown) => {};
  const pendingLoad = new Promise((resolve) => {
    resolveLoader = resolve;
  });

  const routes: RouteObject[] = [
    {
      path: '/',
      Component: Layout,
      children: [
        { index: true, Component: () => <div>Home content</div> },
        { path: 'next', loader: () => pendingLoad, Component: () => <div>Next content</div> },
      ],
    },
  ];

  const { getByText, unmount } = await render(<Router routes={routes} />);
  await expect.element(getByText('Home content')).toBeInTheDocument();

  app.navigation.navigate('/next');
  await expect.element(getByText('Loading...')).toBeInTheDocument();

  resolveLoader();
  await expect.element(getByText('Next content')).toBeInTheDocument();

  await unmount();
});
