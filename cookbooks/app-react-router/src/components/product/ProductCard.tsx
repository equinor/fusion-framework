import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Chip, Card, Typography } from '@equinor/eds-core-react';
import { tokens } from '@equinor/eds-tokens';
import styled from 'styled-components';
import type { Product } from '../../api/ProductApi';

const Styled = {
  Card: styled(Card)<{ $isHovered: boolean }>`
    height: 100%;
    display: flex;
    flex-direction: column;
  `,
  Title: styled(Typography)`
    margin: 0;
  `,
  Image: styled.img<{ $isHovered: boolean }>`
    width: 100%;
    object-fit: cover;
    opacity: ${({ $isHovered }) => ($isHovered ? 1 : 0.7)};
    transition: opacity 0.3s ease-in-out;
  `,
  Content: styled(Card.Content)`
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: ${tokens.spacings.comfortable.x_small};
  `,
  RatingContainer: styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
  `,
  Rating: styled.div`
    font-size: ${tokens.typography.paragraph.body_short.fontSize};
    color: ${tokens.colors.text.static_icons__tertiary.hex};
  `,
  StockBadge: styled.div<{ $inStock: boolean }>`
    padding: ${tokens.spacings.comfortable.x_small};
    border-radius: ${tokens.shape.corners.borderRadius};
    font-size: ${tokens.typography.paragraph.body_short.fontSize};
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
  Price: styled(Typography)`
    font-size: ${tokens.typography.heading.h3.fontSize};
    font-weight: ${tokens.typography.heading.h3.fontWeight};
    color: ${tokens.colors.interactive.primary__resting.hex};
  `,
};

/**
 * ProductCard component with hover effect for images
 */
export function ProductCard({ product }: { product: Product }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Styled.Card
      $isHovered={isHovered}
      elevation={isHovered ? 'overlay' : 'raised'}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Card.Header>
        <Card.HeaderTitle>
          <Styled.Title variant="h4">{product.name}</Styled.Title>
        </Card.HeaderTitle>
        <Chip variant="default">{product.category}</Chip>
      </Card.Header>
      <Card.Media>
        <Styled.Image
          $isHovered={isHovered}
          src={product.image || `https://picsum.photos/400/300?random=${product.id}`}
          alt={product.name}
        />
      </Card.Media>
      <Styled.Content>
        <Styled.RatingContainer>
          <Styled.Rating>
            ⭐ {product.rating} ({product.reviews} reviews)
          </Styled.Rating>
          <Styled.StockBadge $inStock={product.inStock}>
            {product.inStock ? '✓ In Stock' : '✗ Out of Stock'}
          </Styled.StockBadge>
        </Styled.RatingContainer>
        <Styled.Price variant="h3">${product.price}</Styled.Price>
      </Styled.Content>
      <Card.Actions alignRight>
        <Button variant="contained" as={Link} to={`/products/${product.id}`} fullWidth>
          View Details
        </Button>
      </Card.Actions>
    </Styled.Card>
  );
}
