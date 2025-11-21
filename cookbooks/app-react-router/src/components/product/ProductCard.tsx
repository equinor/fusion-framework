import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Chip, Card } from '@equinor/eds-core-react';
import type { Product } from '../../api/ProductApi';

/**
 * ProductCard component with hover effect for images
 */
export function ProductCard({ product }: { product: Product }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Card
      style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
      elevation={isHovered ? 'overlay' : 'raised'}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Card.Header>
        <Card.HeaderTitle>
          <h4 style={{ margin: 0 }}>{product.name}</h4>
        </Card.HeaderTitle>
        <Chip variant="default">{product.category}</Chip>
      </Card.Header>
      <Card.Media>
        <img
          src={product.image || `https://picsum.photos/400/300?random=${product.id}`}
          alt={product.name}
          style={{
            width: '100%',
            objectFit: 'cover',
            opacity: isHovered ? 1 : 0.7,
            transition: 'opacity 0.3s ease-in-out',
          }}
        />
      </Card.Media>
      <Card.Content style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '0.9rem', color: '#666' }}>
            ⭐ {product.rating} ({product.reviews} reviews)
          </div>
          <div
            style={{
              padding: '0.25rem',
              borderRadius: '.25rem',
              fontSize: '0.9rem',
              ...(product.inStock
                ? { backgroundColor: '#e8f5e9', color: '#2e7d32' }
                : { backgroundColor: '#ffebee', color: '#c62828' }),
            }}
          >
            {product.inStock ? '✓ In Stock' : '✗ Out of Stock'}
          </div>
        </div>
        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#0066cc' }}>
          ${product.price}
        </div>
      </Card.Content>
      <Card.Actions alignRight>
        <Button variant="contained" as={Link} to={`/products/${product.id}`} fullWidth>
          View Details
        </Button>
      </Card.Actions>
    </Card>
  );
}
