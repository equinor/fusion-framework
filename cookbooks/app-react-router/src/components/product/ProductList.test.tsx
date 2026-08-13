import { expect } from 'vitest';
import { testWithRouter } from '../../__tests__/test-with-router';

import { ProductList } from './ProductList';
import type { Product } from '../../api/ProductApi';
import { generateProduct } from '../../mocks/generators';

// `inStock` is overridden explicitly so one card renders each availability state.
const products: Product[] = [
  { ...generateProduct(1), inStock: true },
  { ...generateProduct(2), inStock: false },
];

testWithRouter('renders the product count and a card for each product', async ({ render }) => {
  const { getByText, unmount } = await render(<ProductList products={products} total={5} />);

  await expect.element(getByText('Showing 2 of 5 products')).toBeInTheDocument();
  await expect.element(getByText(products[0].name)).toBeInTheDocument();
  await expect.element(getByText(products[1].name)).toBeInTheDocument();

  await unmount();
});

testWithRouter('renders an empty state when there are no products', async ({ render }) => {
  const { getByText, unmount } = await render(<ProductList products={[]} total={0} />);

  await expect.element(getByText('Showing 0 of 0 products')).toBeInTheDocument();
  await expect.element(getByText(/no products found matching your filters/i)).toBeInTheDocument();

  await unmount();
});
