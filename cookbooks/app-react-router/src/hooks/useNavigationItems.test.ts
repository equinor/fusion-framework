import { expect } from 'vitest';
import { test } from '@equinor/fusion-framework-vitest-plugin-react-app/test';
import type { RouteObject } from '@equinor/fusion-framework-react-router';
import { home, work_outline } from '@equinor/eds-icons';

import { useNavigationItems } from './useNavigationItems';

test('returns a navigation item for each route with a title and icon in its handle', async ({ renderHook }) => {
  const routes: RouteObject[] = [
    { path: '/', handle: { route: { title: 'Home', icon: home } } },
    { path: '/users', handle: { route: { title: 'Users', icon: work_outline } } },
  ];

  const { result } = await renderHook(() => useNavigationItems(routes));

  expect(result.current).toEqual([
    { label: 'Home', icon: home, path: '/' },
    { label: 'Users', icon: work_outline, path: '/users' },
  ]);
});

test('skips routes whose handle is missing a title or an icon', async ({ renderHook }) => {
  const routes: RouteObject[] = [
    { path: '/no-handle' },
    { path: '/title-only', handle: { route: { title: 'Title Only' } } },
    { path: '/icon-only', handle: { route: { icon: home } } },
    { path: '/complete', handle: { route: { title: 'Complete', icon: home } } },
  ];

  const { result } = await renderHook(() => useNavigationItems(routes));

  expect(result.current).toEqual([{ label: 'Complete', icon: home, path: '/complete' }]);
});

test('joins nested child paths onto their parent route path', async ({ renderHook }) => {
  const routes: RouteObject[] = [
    {
      path: '/products',
      handle: { route: { title: 'Products', icon: home } },
      children: [{ path: ':id', handle: { route: { title: 'Product Detail', icon: work_outline } } }],
    },
  ];

  const { result } = await renderHook(() => useNavigationItems(routes));

  expect(result.current).toEqual([
    { label: 'Products', icon: home, path: '/products' },
    { label: 'Product Detail', icon: work_outline, path: '/products/:id' },
  ]);
});

test('resolves an index route to its parent path', async ({ renderHook }) => {
  const routes: RouteObject[] = [
    {
      path: '/products',
      children: [{ index: true, handle: { route: { title: 'Products Home', icon: home } } }],
    },
  ];

  const { result } = await renderHook(() => useNavigationItems(routes));

  expect(result.current).toEqual([{ label: 'Products Home', icon: home, path: '/products' }]);
});
