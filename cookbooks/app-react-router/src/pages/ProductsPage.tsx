import { redirect } from 'react-router-dom';
import type {
  LoaderFunctionArgs,
  ActionFunctionArgs,
  RouteComponentProps,
  RouterHandle,
} from '@equinor/fusion-framework-react-router';
import type { Product } from '../api/ProductApi';
import { ProductFilters } from '../components/product/ProductFilters';
import { ProductList } from '../components/product/ProductList';
import { Typography } from '@equinor/eds-core-react';
import { tokens } from '@equinor/eds-tokens';
import { shopping_card } from '@equinor/eds-icons';

type ProductsPageLoaderData = {
  products: Product[];
  categories: string[];
  filter: string | null;
  sort: string;
  inStock: boolean;
  productCount: number;
};

export const handle = {
  route: {
    description: 'Products list page with filtering and sorting',
    params: {},
    search: {
      filter: 'Filter products by category (electronics, furniture)',
      sort: 'Sort products by price (asc, desc) or name (name-asc, name-desc)',
      inStock: 'Filter to show only in-stock products (true/false)',
    },
  },
  navigation: {
    label: 'Products',
    icon: shopping_card,
    path: '/products',
  },
} as const satisfies RouterHandle;

export async function clientLoader(args: LoaderFunctionArgs) {
  const { request, fusion } = args;
  const url = new URL(request.url);
  const filter = url.searchParams.get('filter') ?? null;
  const sort = url.searchParams.get('sort') || 'name-asc';
  const inStock = url.searchParams.get('inStock') === 'true';

  // Use the unified API from context
  const { api } = fusion.context;

  // Fetch filtered products and categories in parallel
  const [{ products, productCount }, categories] = await Promise.all([
    api.product.getProducts({ filter, sort, inStock }),
    api.product.getCategories(),
  ]);

  return { products, categories, filter, sort, inStock, productCount };
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const filter = (formData.get('filter') as string)?.trim() || '';
  const sort = (formData.get('sort') as string)?.trim() || 'name-asc';
  const inStock = formData.get('inStock') === 'true';

  // Build search params
  const searchParams = new URLSearchParams();
  if (filter) {
    searchParams.set('filter', filter);
  }
  if (sort && sort !== 'name-asc') {
    searchParams.set('sort', sort);
  }
  if (inStock) {
    searchParams.set('inStock', 'true');
  }

  // Redirect to same page with search parameters
  const queryString = searchParams.toString();
  return redirect(queryString ? `.?${queryString}` : '.');
}

export default function ProductsPage(props: RouteComponentProps<ProductsPageLoaderData>) {
  const { loaderData } = props;
  const { products, categories, filter, sort, inStock, productCount } = loaderData;

  return (
    <>
      <Typography variant="h1" style={{ marginBottom: tokens.spacings.comfortable.large }}>
        Products
      </Typography>
      <ProductFilters categories={categories} filter={filter} sort={sort} inStock={inStock} />
      <ProductList products={products} total={productCount} />
    </>
  );
}
