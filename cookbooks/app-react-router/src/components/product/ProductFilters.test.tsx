import { expect } from 'vitest';
import { testWithRouter } from '../../__tests__/test-with-router';

import { ProductFilters } from './ProductFilters';

testWithRouter(
  'renders category options and hides "Clear Filters" when using defaults',
  async ({ render }) => {
    const { getByRole, unmount } = await render(
      <ProductFilters
        categories={['electronics', 'furniture']}
        filter={null}
        sort="name-asc"
        inStock={false}
      />,
    );

    await expect.element(getByRole('option', { name: 'Electronics' })).toBeInTheDocument();
    await expect.element(getByRole('option', { name: 'Furniture' })).toBeInTheDocument();
    await expect.element(getByRole('button', { name: /clear filters/i })).not.toBeInTheDocument();

    await unmount();
  },
);

testWithRouter('shows "Clear Filters" when a non-default filter is active', async ({ render }) => {
  const { getByRole, unmount } = await render(
    <ProductFilters
      categories={['electronics']}
      filter="electronics"
      sort="name-asc"
      inStock={false}
    />,
  );

  await expect.element(getByRole('button', { name: /clear filters/i })).toBeInTheDocument();

  await unmount();
});
