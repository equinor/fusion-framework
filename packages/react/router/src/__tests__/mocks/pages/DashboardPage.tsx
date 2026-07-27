export const handle = {
  route: {
    description: 'Dashboard',
    search: {
      view: 'View mode',
    },
  },
};

/**
 * Mock dashboard page used in router tests.
 *
 * @returns The dashboard page
 */
export default function DashboardPage() {
  return <div>Dashboard Page</div>;
}
