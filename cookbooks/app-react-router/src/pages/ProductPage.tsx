import { Link, useSearchParams, useParams } from 'react-router-dom';
import { Button } from '@equinor/eds-core-react';
import type {
  LoaderFunctionArgs,
  RouteComponentProps,
  RouterHandle,
} from '@equinor/fusion-framework-react-router';
import { styles } from './ProductPage.styles';
import type { Product } from '../api/ProductApi';

export const handle = {
  route: {
    description: 'Product detail page',
    params: {
      id: 'Product identifier',
    },
    search: {
      view: 'View mode (details, specs, reviews)',
      tab: 'Active tab for reviews section',
    },
  },
} satisfies RouterHandle;

export const clientLoader = async ({ params, request, fusion }: LoaderFunctionArgs) => {
  const productId = params.id;
  if (!productId) {
    throw new Response('Product ID is required', { status: 400 });
  }

  const url = new URL(request.url);
  const view = url.searchParams.get('view') || 'details';
  const tab = url.searchParams.get('tab') || 'all';

  // Use the unified API from context
  const { api } = fusion.context;

  try {
    const product = await api.product.getProduct(parseInt(productId, 10));

    return {
      product,
      view,
      tab,
    };
  } catch (error) {
    if (error instanceof Error && error.message === 'Product not found') {
      throw new Response('Product not found', { status: 404 });
    }
    throw new Response('Failed to fetch product', { status: 500 });
  }
};

type ProductPageLoaderData = {
  product: Product;
  view: string;
  tab: string;
};

export default function ProductPage(props: RouteComponentProps<ProductPageLoaderData>) {
  const { loaderData } = props;
  const [searchParams, setSearchParams] = useSearchParams();
  const params = useParams();
  const { product, view, tab } = loaderData;

  const setView = (newView: string) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('view', newView);
    setSearchParams(newParams);
  };

  const setTab = (newTab: string) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('tab', newTab);
    setSearchParams(newParams);
  };

  return (
    <>
      <Link to="/products" style={styles.backLink}>
        ← Back to Products
      </Link>

      <h1 style={styles.title}>{product.name}</h1>
      <div style={styles.category}>Category: {product.category}</div>
      <div style={styles.price}>${product.price}</div>

      <div
        style={{
          ...styles.stock,
          ...(product.inStock ? styles.inStock : styles.outOfStock),
        }}
      >
        {product.inStock ? '✓ In Stock' : '✗ Out of Stock'}
      </div>

      <div style={styles.tabs}>
        <Button
          variant={view === 'details' ? 'contained' : 'ghost'}
          onClick={() => setView('details')}
        >
          Details
        </Button>
        <Button variant={view === 'specs' ? 'contained' : 'ghost'} onClick={() => setView('specs')}>
          Specifications
        </Button>
        <Button
          variant={view === 'reviews' ? 'contained' : 'ghost'}
          onClick={() => setView('reviews')}
        >
          Reviews ({product.reviews})
        </Button>
      </div>

      <div style={styles.tabContent}>
        {view === 'details' && (
          <div>
            <p style={styles.description}>{product.description}</p>
            <div style={styles.info}>
              <div style={styles.infoTitle}>Product Information</div>
              <div style={styles.infoContent}>
                Rating: {product.rating} / 5.0 ⭐<br />
                Reviews: {product.reviews}
              </div>
            </div>
          </div>
        )}

        {view === 'specs' && (
          <div>
            <div style={styles.info}>
              <div style={styles.infoTitle}>Specifications</div>
              <div style={styles.infoContent}>
                Product ID: {product.id}
                <br />
                Category: {product.category}
                <br />
                Price: ${product.price}
                <br />
                Availability: {product.inStock ? 'In Stock' : 'Out of Stock'}
              </div>
            </div>
          </div>
        )}

        {view === 'reviews' && (
          <div>
            <div style={styles.tabs}>
              <Button variant={tab === 'all' ? 'contained' : 'ghost'} onClick={() => setTab('all')}>
                All Reviews
              </Button>
              <Button
                variant={tab === 'positive' ? 'contained' : 'ghost'}
                onClick={() => setTab('positive')}
              >
                Positive
              </Button>
              <Button
                variant={tab === 'negative' ? 'contained' : 'ghost'}
                onClick={() => setTab('negative')}
              >
                Negative
              </Button>
            </div>
            <div style={styles.info}>
              <div style={styles.infoTitle}>Reviews ({tab})</div>
              <div style={styles.infoContent}>
                Showing {tab} reviews for {product.name}
                <br />
                Average rating: {product.rating} / 5.0
                <br />
                Total reviews: {product.reviews}
              </div>
            </div>
          </div>
        )}
      </div>

      <div style={styles.info}>
        <div style={styles.infoTitle}>Route Information</div>
        <div style={styles.infoContent}>
          Route Param (id): {params.id}
          <br />
          Search Param (view): {view}
          <br />
          Search Param (tab): {tab}
        </div>
      </div>
    </>
  );
}
