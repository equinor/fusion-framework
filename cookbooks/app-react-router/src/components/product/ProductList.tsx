import { tokens } from '@equinor/eds-tokens';
import styled from 'styled-components';
import { Typography } from '@equinor/eds-core-react';
import type { Product } from '../../api/ProductApi';
import { ProductCard } from './ProductCard';

interface ProductListProps {
  products?: Product[];
  total?: number;
  filtered?: number;
  styles?: React.CSSProperties;
}

const Styled = {
  Container: styled.div``,
  Info: styled.div`
    margin-bottom: ${tokens.spacings.comfortable.medium};
    padding: ${tokens.spacings.comfortable.medium};
    background-color: ${tokens.colors.ui.background__info.hex};
    border-radius: ${tokens.shape.corners.borderRadius};
    color: ${tokens.colors.interactive.primary__resting.hex};
    font-size: ${tokens.typography.paragraph.body_short.fontSize};
    width: calc(100% - ${tokens.spacings.comfortable.large});
  `,
  ProductGrid: styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: ${tokens.spacings.comfortable.large};
  `,
  Empty: styled(Typography).attrs({ variant: 'body_short' })`
    text-align: center;
    padding: ${tokens.spacings.comfortable.large};
    color: ${tokens.colors.text.static_icons__tertiary.hex};
  `,
};

/**
 * Product list component displaying filtered products with count information
 * @param products - Array of products to display
 * @param total - Total number of products before filtering
 * @param filtered - Number of products after filtering
 */
export function ProductList(props: ProductListProps) {
  const { products, total } = props;
  return (
    <Styled.Container style={props.styles}>
      <Styled.Info>
        Showing {products?.length} of {total} products
      </Styled.Info>

      {products?.length === 0 ? (
        <Styled.Empty>No products found matching your filters.</Styled.Empty>
      ) : (
        <Styled.ProductGrid>
          {products?.map((product: Product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </Styled.ProductGrid>
      )}
    </Styled.Container>
  );
}
