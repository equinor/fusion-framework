import { expect } from 'vitest';
import { testWithRouter } from '../../../__tests__/test-with-router';

import { createRouteProps } from '../../../__tests__/create-route-props';
import ProductPage from './index';
import type { Product } from '../../../api/ProductApi';

const product: Product = {
  id: 42,
  name: 'Wireless Mouse',
  category: 'Electronics',
  price: 29.99,
  description: 'A wireless mouse',
  inStock: true,
  reviews: 12,
  rating: 4.5,
  image: '',
};

testWithRouter('renders the loaded product in the details view', async ({ render }) => {
  const props = createRouteProps({ product, view: 'details', tab: 'all' });
  const { getByText, getByRole, unmount } = await render(<ProductPage {...props} />);

  await expect.element(getByText(product.name, { exact: true })).toBeInTheDocument();
  await expect.element(getByText(`$${product.price}`)).toBeInTheDocument();
  await expect.element(getByText(/✓ in stock/i)).toBeInTheDocument();

  const backLink = getByRole('link', { name: /back to products/i });
  await expect.element(backLink).toHaveAttribute('href', expect.stringContaining('/products'));

  await unmount();
});

testWithRouter('renders the specifications view when selected', async ({ render }) => {
  const props = createRouteProps({ product, view: 'specs', tab: 'all' });
  const { getByText, unmount } = await render(<ProductPage {...props} />);

  await expect.element(getByText(/Product ID:/)).toBeInTheDocument();

  await unmount();
});
