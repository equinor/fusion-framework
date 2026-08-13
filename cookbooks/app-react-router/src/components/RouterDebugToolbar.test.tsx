import { expect } from 'vitest';
import { testWithRouter } from '../__tests__/test-with-router';

import { RouterDebugToolbar } from './RouterDebugToolbar';

testWithRouter('debug info is hidden until the toggle button is clicked', async ({ render }) => {
  const { getByRole, getByText, unmount } = await render(<RouterDebugToolbar />);

  await expect.element(getByRole('button', { name: /show debug/i })).toBeInTheDocument();
  await expect.element(getByText('Router Debug Info')).not.toBeInTheDocument();

  await unmount();
});

testWithRouter(
  'clicking the toggle reveals the router and navigation debug sections',
  async ({ render }) => {
    const { getByRole, getByText, unmount } = await render(<RouterDebugToolbar />);

    await getByRole('button', { name: /show debug/i }).click();

    await expect.element(getByText('Router Debug Info')).toBeInTheDocument();
    await expect.element(getByText('React Router Location')).toBeInTheDocument();
    await expect.element(getByText('Navigation Provider State')).toBeInTheDocument();
    await expect.element(getByRole('button', { name: /hide debug/i })).toBeInTheDocument();

    await unmount();
  },
);
