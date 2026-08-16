import { expect } from 'vitest';
import { testWithRouter } from '../../__tests__/test-with-router';

import { createRouteProps } from '../../__tests__/create-route-props';
import ProductsPage from './index';
import type { Product } from '../../api/ProductApi';
import { generateProducts } from '../../mocks/generators';

const products: Product[] = generateProducts(1);

testWithRouter('renders the page heading, filters, and loaded products', async ({ render }) => {
  const props = createRouteProps({
    products,
    categories: ['Electronics', 'Furniture'],
    filter: null,
    sort: 'name-asc',
    inStock: false,
    productCount: 1,
  });
  const { getByText, unmount } = await render(<ProductsPage {...props} />);

  await expect.element(getByText('Products', { exact: true })).toBeInTheDocument();
  await expect.element(getByText('Showing 1 of 1 products')).toBeInTheDocument();
  await expect.element(getByText(products[0].name)).toBeInTheDocument();

  await unmount();
});
