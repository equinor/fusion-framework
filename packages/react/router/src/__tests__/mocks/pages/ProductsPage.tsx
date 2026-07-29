export const handle = {
  route: {
    description: 'Product list page',
    search: {
      sort: 'asc (default), desc for descending',
      filter: 'Filter by category',
    },
  },
};

/**
 * Mock product list page used in router tests.
 *
 * @returns The products page
 */
export default function ProductsPage() {
  return <div>Products Page</div>;
}
