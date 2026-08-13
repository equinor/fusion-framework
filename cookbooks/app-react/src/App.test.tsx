import { expect } from 'vitest';
import { test } from '@equinor/fusion-framework-vitest-plugin-react-app/test';

import { App } from './App';

test('renders the cookbook greeting once the app configuration has initialized', async ({ render }) => {
  const { getByRole, unmount } = await render(<App />);

  await expect.element(getByRole('heading', { name: /hello fusion/i })).toHaveTextContent(
    'Hello Fusion',
  );

  await unmount();
});

