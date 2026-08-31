import { expect } from 'vitest';
import { testWithRouter } from '../../__tests__/test-with-router';

import { ProductCard } from './ProductCard';
import type { Product } from '../../api/ProductApi';
import { generateProduct } from '../../mocks/generators';

// Same generator + seed the dev server and API mock use, so the fixture stays in sync with the real shape.
const baseProduct: Product = generateProduct(42);

testWithRouter(
  'renders product details and a link to the product detail route',
  async ({ render }) => {
    const { getByText, getByRole, unmount } = await render(<ProductCard product={baseProduct} />);

    await expect.element(getByText(baseProduct.name)).toBeInTheDocument();
    await expect.element(getByText(baseProduct.category)).toBeInTheDocument();
    await expect.element(getByText(`$${baseProduct.price}`)).toBeInTheDocument();
    await expect.element(getByText(/✓ in stock/i)).toBeInTheDocument();

    const link = getByRole('link', { name: /view details/i });
    await expect
      .element(link)
      .toHaveAttribute('href', expect.stringContaining(`/products/${baseProduct.id}`));

    await unmount();
  },
);

testWithRouter(
  'shows an out-of-stock badge when the product is not in stock',
  async ({ render }) => {
    const product: Product = { ...baseProduct, inStock: false };
    const { getByText, unmount } = await render(<ProductCard product={product} />);

    await expect.element(getByText(/✗ out of stock/i)).toBeInTheDocument();

    await unmount();
  },
);
