import { useRef, useCallback } from 'react';
import { Form, useSubmit } from 'react-router-dom';
import { Button, NativeSelect, Checkbox } from '@equinor/eds-core-react';

interface ProductFiltersProps {
  categories: string[];
  filter: string | null;
  sort: string;
  inStock: boolean;
}

const styles = {
  filters: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '2rem',
    padding: '1rem',
    backgroundColor: '#f8f8f8',
    borderRadius: '4px',
    flexWrap: 'wrap' as const,
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
  },
};

/**
 * Product filters form component for filtering and sorting products
 * @param categories - Available product categories
 * @param filter - Current category filter value
 * @param sort - Current sort option
 * @param inStock - Whether to show only in-stock products
 */
export function ProductFilters({ categories, filter, sort, inStock }: ProductFiltersProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const submit = useSubmit();

  const handleReset = useCallback(() => {
    // Submit form with empty/default values to clear URL parameters
    submit(new FormData(), { method: 'post' });
  }, [submit]);

  return (
    <Form
      ref={formRef}
      method="post"
      onChange={(e) => e.currentTarget.requestSubmit()}
      onReset={handleReset}
      style={styles.filters}
    >
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', width: '100%' }}>
        <NativeSelect id="filter" name="filter" label="Category Filter" defaultValue={filter || ''}>
          <option value="">All Categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </option>
          ))}
        </NativeSelect>

        <NativeSelect id="sort" name="sort" label="Sort By" defaultValue={sort || 'name-asc'}>
          <option value="name-asc">Name (A-Z)</option>
          <option value="name-desc">Name (Z-A)</option>
          <option value="price-asc">Price (Low to High)</option>
          <option value="price-desc">Price (High to Low)</option>
        </NativeSelect>

        <Checkbox
          style={{ width: 'inherit' }}
          name="inStock"
          label="In Stock Only"
          defaultChecked={inStock}
          value="true"
        />

        {(filter || sort !== 'name-asc' || inStock) && (
          <Button type="reset" variant="outlined">
            Clear Filters
          </Button>
        )}
      </div>
    </Form>
  );
}

