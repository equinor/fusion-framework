import { expect } from 'vitest';
import { testWithRouter } from '../../../__tests__/test-with-router';

import { createRouteProps } from '../../../__tests__/create-route-props';
import UserPage from './index';
import type { User } from '../../../api/UserApi';

const user: User = {
  id: 1,
  name: 'Ada Lovelace',
  email: 'ada.lovelace@example.com',
  role: 'Developer',
  department: 'Engineering',
  phone: '555-0100',
  location: 'London',
  joinDate: '2020-01-15',
};

testWithRouter(
  'renders the loaded user profile with a link back to the users list',
  async ({ render }) => {
    const props = createRouteProps({ user });
    const { getByText, getByRole, unmount } = await render(<UserPage {...props} />);

    await expect.element(getByText(user.name)).toBeInTheDocument();

    const backLink = getByRole('link', { name: /back to users/i });
    await expect.element(backLink).toHaveAttribute('href', `${window.location.origin}/users`);

    await unmount();
  },
);
