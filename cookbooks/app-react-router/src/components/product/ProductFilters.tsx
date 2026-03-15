import { useRef, useCallback } from 'react';
import { Form, useSubmit } from 'react-router-dom';
import { Button, NativeSelect, Checkbox } from '@equinor/eds-core-react';
import { tokens } from '@equinor/eds-tokens';
import styled from 'styled-components';

interface ProductFiltersProps {
  categories: string[];
  filter: string | null;
  sort: string;
  inStock: boolean;
}

const Styled = {
  Filters: styled(Form)`
    display: flex;
    gap: ${tokens.spacings.comfortable.medium};
    margin-bottom: ${tokens.spacings.comfortable.large};
    padding: ${tokens.spacings.comfortable.medium};
    background-color: ${tokens.colors.ui.background__light.hex};
    border-radius: ${tokens.shape.corners.borderRadius};
    flex-wrap: wrap;
  `,
  FormGroup: styled.div`
    display: flex;
    gap: ${tokens.spacings.comfortable.x_small};
    align-items: center;
    width: 100%;
  `,
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
    <Styled.Filters
      ref={formRef}
      method="post"
      onChange={(e) => e.currentTarget.requestSubmit()}
      onReset={handleReset}
    >
      <Styled.FormGroup>
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

        <Checkbox name="inStock" label="In Stock Only" defaultChecked={inStock} value="true" />

        {(filter || sort !== 'name-asc' || inStock) && (
          <Button type="reset" variant="outlined">
            Clear Filters
          </Button>
        )}
      </Styled.FormGroup>
    </Styled.Filters>
  );
}
