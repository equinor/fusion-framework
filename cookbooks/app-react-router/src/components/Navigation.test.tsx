import { expect, vi } from 'vitest';
import { testWithRouter } from '../__tests__/test-with-router';

import { Navigation } from './Navigation';

testWithRouter('renders a sidebar link for each top-level page', async ({ render }) => {
  const { getByText, unmount } = await render(<Navigation />);

  await expect.element(getByText('Home')).toBeInTheDocument();
  await expect.element(getByText('Products')).toBeInTheDocument();
  await expect.element(getByText('Users')).toBeInTheDocument();
  await expect.element(getByText('People')).toBeInTheDocument();

  await unmount();
});

testWithRouter('navigating to a page updates the URL', async ({ render, app }) => {
  const { getByText, unmount } = await render(<Navigation />);

  await getByText('Products').click();

  await vi.waitFor(() => expect(app.navigation.path.pathname).toBe('/products'));

  await unmount();
});

testWithRouter('the active link swaps when navigating to a different page', async ({ render, app }) => {
  const { getByText, unmount } = await render(<Navigation />);

  // active state is only reflected as a styled-components color, not a DOM attribute
  const colorOf = (label: string) => getComputedStyle(getByText(label).element()).color;

  // navigate via the router's own click handler first, so its internal location is
  // guaranteed to be in sync rather than relying on the initial location above
  await getByText('Home').click();
  await vi.waitFor(() => expect(app.navigation.path.pathname).toBe('/'));

  // Users is never navigated to in this test, so its color is a stable "inactive" reference
  const inactiveColor = colorOf('Users');
  await vi.waitFor(() => {
    expect(colorOf('Home')).not.toBe(inactiveColor);
    expect(colorOf('Products')).toBe(inactiveColor);
  });

  await getByText('Products').click();

  // the URL changes synchronously on click, so styling lags at least one render behind it —
  // retry on the color itself rather than on the pathname, which would resolve too early
  await vi.waitFor(() => {
    expect(colorOf('Home')).toBe(inactiveColor);
    expect(colorOf('Products')).not.toBe(inactiveColor);
  });

  await unmount();
});
