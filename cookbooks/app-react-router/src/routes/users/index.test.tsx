import { expect } from 'vitest';
import { testWithRouter } from '../../__tests__/test-with-router';

import { createRouteProps } from '../../__tests__/create-route-props';
import UsersPage from './index';
import type { User } from '../../api/UserApi';
import { generateUsers } from '../../mocks/generators';

const users: User[] = generateUsers(1);

testWithRouter('renders the page heading and the loaded users', async ({ render }) => {
  const props = createRouteProps({
    users,
    page: 1,
    limit: 5,
    total: 1,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
  });
  const { getByText, unmount } = await render(<UsersPage {...props} />);

  await expect.element(getByText('Users', { exact: true })).toBeInTheDocument();
  await expect.element(getByText('Showing 1 of 1 users (Page 1 of 1)')).toBeInTheDocument();
  await expect.element(getByText(users[0].name)).toBeInTheDocument();

  await unmount();
});

testWithRouter('disables pagination controls on the first and last page', async ({ render }) => {
  const props = createRouteProps({
    users,
    page: 1,
    limit: 5,
    total: 1,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
  });
  const { getByRole, unmount } = await render(<UsersPage {...props} />);

  await expect.element(getByRole('button', { name: 'Previous' })).toBeDisabled();
  await expect.element(getByRole('button', { name: 'Next' })).toBeDisabled();

  await unmount();
});
