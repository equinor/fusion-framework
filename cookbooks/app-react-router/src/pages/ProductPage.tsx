import { Link, useSearchParams, useParams } from 'react-router-dom';
import { Button, Typography } from '@equinor/eds-core-react';
import { tokens } from '@equinor/eds-tokens';
import styled from 'styled-components';
import type {
  LoaderFunctionArgs,
  RouteComponentProps,
  RouterHandle,
} from '@equinor/fusion-framework-react-router';
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
} as const satisfies RouterHandle;

const Styled = {
  BackLink: styled(Link)`
    display: inline-block;
    margin-bottom: ${tokens.spacings.comfortable.small};
    color: ${tokens.colors.interactive.primary__resting.hex};
    text-decoration: none;
    font-size: ${tokens.typography.paragraph.caption.fontSize};
  `,
  Title: styled(Typography)`
    margin-bottom: ${tokens.spacings.comfortable.x_small};
  `,
  Category: styled(Typography)`
    margin-bottom: ${tokens.spacings.comfortable.medium};
    text-transform: capitalize;
    color: ${tokens.colors.text.static_icons__tertiary.hex};
  `,
  Price: styled(Typography)`
    font-weight: ${tokens.typography.paragraph.body_short_bold.fontWeight};
    color: ${tokens.colors.interactive.primary__resting.hex};
    margin-bottom: ${tokens.spacings.comfortable.medium};
  `,
  Stock: styled.div<{ $inStock: boolean }>`
    font-size: ${tokens.typography.paragraph.body_short.fontSize};
    margin-bottom: ${tokens.spacings.comfortable.medium};
    padding: ${tokens.spacings.comfortable.medium};
    border-radius: ${tokens.shape.corners.borderRadius};
    background-color: ${({ $inStock }) =>
      $inStock ? tokens.colors.ui.background__light.hex : tokens.colors.ui.background__warning.hex};
    border: 1px solid
      ${({ $inStock }) =>
        $inStock
          ? tokens.colors.interactive.success__resting.hex
          : tokens.colors.interactive.danger__resting.hex};
    color: ${({ $inStock }) =>
      $inStock
        ? tokens.colors.interactive.success__resting.hex
        : tokens.colors.interactive.danger__resting.hex};
  `,
  Tabs: styled.div`
    display: flex;
    gap: ${tokens.spacings.comfortable.x_small};
    margin-bottom: ${tokens.spacings.comfortable.medium};
    border-bottom: 2px solid ${tokens.colors.ui.background__medium.hex};
  `,
  TabContent: styled.div`
    padding: ${tokens.spacings.comfortable.small} 0;
  `,
  Description: styled(Typography)`
    line-height: 1.6;
    margin-bottom: ${tokens.spacings.comfortable.large};
  `,
  Info: styled.div`
    margin-top: ${tokens.spacings.comfortable.large};
    padding: ${tokens.spacings.comfortable.small};
    background-color: ${tokens.colors.ui.background__light.hex};
    border-radius: ${tokens.shape.corners.borderRadius};
  `,
  InfoTitle: styled.div`
    font-size: ${tokens.typography.paragraph.caption.fontSize};
    font-weight: ${tokens.typography.paragraph.body_short_bold.fontWeight};
    color: ${tokens.colors.text.static_icons__tertiary.hex};
    margin-bottom: ${tokens.spacings.comfortable.x_small};
    text-transform: uppercase;
  `,
  InfoContent: styled.div`
    font-size: ${tokens.typography.paragraph.caption.fontSize};
    font-family: monospace;
    color: ${tokens.colors.text.static_icons__default.hex};
  `,
};

export async function clientLoader({ params, request, fusion }: LoaderFunctionArgs) {
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
}

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
      <Styled.BackLink to="/products">← Back to Products</Styled.BackLink>

      <Styled.Title variant="h1">{product.name}</Styled.Title>
      <Styled.Category variant="body_short">Category: {product.category}</Styled.Category>
      <Styled.Price variant="h2">${product.price}</Styled.Price>

      <Styled.Stock $inStock={product.inStock}>
        {product.inStock ? '✓ In Stock' : '✗ Out of Stock'}
      </Styled.Stock>

      <Styled.Tabs>
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
      </Styled.Tabs>

      <Styled.TabContent>
        {view === 'details' && (
          <div>
            <Styled.Description variant="body_long">{product.description}</Styled.Description>
            <Styled.Info>
              <Styled.InfoTitle>Product Information</Styled.InfoTitle>
              <Styled.InfoContent>
                Rating: {product.rating} / 5.0 ⭐<br />
                Reviews: {product.reviews}
              </Styled.InfoContent>
            </Styled.Info>
          </div>
        )}

        {view === 'specs' && (
          <div>
            <Styled.Info>
              <Styled.InfoTitle>Specifications</Styled.InfoTitle>
              <Styled.InfoContent>
                Product ID: {product.id}
                <br />
                Category: {product.category}
                <br />
                Price: ${product.price}
                <br />
                Availability: {product.inStock ? 'In Stock' : 'Out of Stock'}
              </Styled.InfoContent>
            </Styled.Info>
          </div>
        )}

        {view === 'reviews' && (
          <div>
            <Styled.Tabs>
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
            </Styled.Tabs>
            <Styled.Info>
              <Styled.InfoTitle>Reviews ({tab})</Styled.InfoTitle>
              <Styled.InfoContent>
                Showing {tab} reviews for {product.name}
                <br />
                Average rating: {product.rating} / 5.0
                <br />
                Total reviews: {product.reviews}
              </Styled.InfoContent>
            </Styled.Info>
          </div>
        )}
      </Styled.TabContent>

      <Styled.Info>
        <Styled.InfoTitle>Route Information</Styled.InfoTitle>
        <Styled.InfoContent>
          Route Param (id): {params.id}
          <br />
          Search Param (view): {view}
          <br />
          Search Param (tab): {tab}
        </Styled.InfoContent>
      </Styled.Info>
    </>
  );
}
