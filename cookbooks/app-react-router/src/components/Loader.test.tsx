import { expect } from 'vitest';
import { test } from '@equinor/fusion-framework-vitest-plugin-react-app/test';

import { Loader } from './Loader';

test('renders a loading heading and progress indicator', async ({ render }) => {
  const { getByRole, getByText, unmount } = await render(<Loader />);

  await expect.element(getByRole('heading', { name: /loading/i })).toBeInTheDocument();
  await expect.element(getByText('Loading...')).toBeInTheDocument();

  await unmount();
});
