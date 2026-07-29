export const handle = {
  route: {
    description: 'Users list page',
  },
};

/**
 * Mock directory-based (fs-routing) users index page used in router tests.
 *
 * @returns The users list page
 */
export default function UsersIndexPage() {
  return <div>Users</div>;
}
