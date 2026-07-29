export const handle = {
  route: {
    description: 'Details of a product',
    params: {
      id: 'identifier of the product',
    },
    search: {
      sort: 'asc (default), desc for descending',
      'filter.type': 'Product type to filter by',
    },
  },
};

/**
 * Mock product details page used in router tests.
 *
 * @returns The product page
 */
export default function ProductPage() {
  return <div>Product Page</div>;
}
