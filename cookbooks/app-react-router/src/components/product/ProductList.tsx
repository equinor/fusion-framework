import type { Product } from '../../api/ProductApi';
import { ProductCard } from './ProductCard';

interface ProductListProps {
  products?: Product[];
  total?: number;
  filtered?: number;
  styles?: React.CSSProperties;
}

const styles = {
  info: {
    marginBottom: '1rem',
    padding: '0.75rem',
    backgroundColor: '#e3f2fd',
    borderRadius: '4px',
    color: '#1976d2',
    width: 'calc(100% - 1.5rem)',
  },
  productGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '1.5rem',
  },
  empty: {
    textAlign: 'center' as const,
    padding: '2rem',
    color: '#666',
  },
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
    <div style={props.styles}>
      <div style={styles.info}>
        Showing {products?.length} of {total} products
      </div>

      {products?.length === 0 ? (
        <div style={styles.empty}>No products found matching your filters.</div>
      ) : (
        <div style={styles.productGrid}>
          {products?.map((product: Product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
