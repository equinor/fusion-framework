export const handle = {
  route: {
    description: 'Products list page',
  },
};

/**
 * Mock directory-based (fs-routing) products index page used in router tests.
 *
 * @returns The products list page
 */
export default function ProductsIndexPage() {
  return <div>Products</div>;
}
