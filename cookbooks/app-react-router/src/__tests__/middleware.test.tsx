import { afterEach, expect, vi } from 'vitest';
import { test } from '@equinor/fusion-framework-vitest-plugin-react-app/test';
import App from '../App';

afterEach(() => vi.restoreAllMocks());

test('runs nested middleware around protected loaders with isolated typed context', async ({
  render,
}) => {
  const telemetry = vi.spyOn(console, 'info');
  const { getByRole, getByText, getByTitle, unmount } = await render(<App />);
  await expect
    .element(getByRole('heading', { name: /cookbook - react router app/i }))
    .toBeVisible();

  await getByTitle('Middleware Demo').click();
  await getByRole('link', { name: 'Allow report' }).click();
  await expect.element(getByRole('heading', { name: 'Demo report first' })).toBeVisible();
  await expect.element(getByText('Viewer from middleware: Demo reader')).toBeVisible();
  const events = [
    'layout:before',
    'guard',
    'report:before',
    'report:loader',
    'report:after',
    'layout:after',
  ];
  await expect.poll(() => telemetry.mock.calls).toContainEqual(['routing-demo', events]);

  await getByRole('link', { name: 'Next report' }).click();
  await expect.element(getByRole('heading', { name: 'Demo report next' })).toBeVisible();
  // A retained layout must still guard the next child, using a fresh execution context.
  await expect
    .poll(() => telemetry.mock.calls.filter(([label]) => label === 'routing-demo'))
    .toEqual([
      ['routing-demo', events],
      ['routing-demo', events],
    ]);
  await unmount();
});

test('redirects denial before running child middleware or its loader', async ({ render }) => {
  const telemetry = vi.spyOn(console, 'info');
  const { getByRole, getByText, getByTitle, unmount } = await render(<App />);
  await expect
    .element(getByRole('heading', { name: /cookbook - react router app/i }))
    .toBeVisible();

  await getByTitle('Middleware Demo').click();
  await getByRole('link', { name: 'Deny report' }).click();
  await expect
    .element(getByText('Demo access denied; redirected before the report loader.'))
    .toBeVisible();
  await expect
    .element(getByRole('heading', { name: 'Middleware demo', exact: true }))
    .toBeVisible();
  await expect
    .poll(() => telemetry.mock.calls)
    .toContainEqual(['routing-demo', ['layout:before', 'guard', 'layout:after']]);
  await expect.element(getByRole('heading', { name: 'Demo report first' })).not.toBeInTheDocument();
  await unmount();
});

test('surfaces a guard failure at its boundary without protected downstream work', async ({
  render,
}) => {
  const telemetry = vi.spyOn(console, 'info');
  const { getByRole, getByText, getByTitle, unmount } = await render(<App />);
  await expect
    .element(getByRole('heading', { name: /cookbook - react router app/i }))
    .toBeVisible();

  await getByTitle('Middleware Demo').click();
  await getByRole('link', { name: 'Fail access check' }).click();
  await expect.element(getByRole('heading', { name: 'Middleware failed' })).toBeVisible();
  await expect.element(getByText('Demo access service unavailable')).toBeVisible();
  await expect
    .poll(() => telemetry.mock.calls)
    .toContainEqual(['routing-demo', ['layout:before', 'guard', 'layout:after']]);
  await expect.element(getByRole('heading', { name: 'Demo report first' })).not.toBeInTheDocument();
  await unmount();
});
