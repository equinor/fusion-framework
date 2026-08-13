import { expect } from 'vitest';
import { test } from '@equinor/fusion-framework-vitest-plugin-react-app/test';

import { UserDetail } from './UserDetail';

const baseUser = {
  id: 1,
  name: 'Ada Lovelace',
  email: 'ada.lovelace@example.com',
  role: 'Developer',
  department: 'Engineering',
  phone: '555-0100',
  location: 'London',
  joinDate: '2020-01-15',
};

test('renders the user profile and contact information', async ({ render }) => {
  const { getByText, unmount } = await render(<UserDetail user={baseUser} />);

  await expect.element(getByText(baseUser.name)).toBeInTheDocument();
  // role/department/email are each rendered twice (chip + info value section)
  await expect.element(getByText(baseUser.role).first()).toBeInTheDocument();
  await expect.element(getByText(baseUser.department).first()).toBeInTheDocument();
  await expect.element(getByText(baseUser.phone)).toBeInTheDocument();
  await expect.element(getByText(baseUser.location)).toBeInTheDocument();
  await expect.element(getByText(baseUser.joinDate)).toBeInTheDocument();
  await expect.element(getByText(baseUser.email).first()).toBeInTheDocument();

  await unmount();
});

test('renders roles and departments not in the known chip-variant mapping', async ({ render }) => {
  const user = { ...baseUser, role: 'Intern', department: 'Sales' };
  const { getByText, unmount } = await render(<UserDetail user={user} />);

  await expect.element(getByText('Intern').first()).toBeInTheDocument();
  await expect.element(getByText('Sales').first()).toBeInTheDocument();

  await unmount();
});
