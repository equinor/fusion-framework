import { expect } from 'vitest';
import { test } from '@equinor/fusion-framework-vitest-plugin-react-app/test';

import { createRouteProps } from '../__tests__/create-route-props';
import HomePage from './index';

test('renders the README content inside the markdown viewer', async ({ render }) => {
  const props = createRouteProps({ content: 'Cookbook readme content' });
  const { getByText, unmount } = await render(<HomePage {...props} />);

  await expect.element(getByText('Cookbook readme content')).toBeInTheDocument();

  await unmount();
});
