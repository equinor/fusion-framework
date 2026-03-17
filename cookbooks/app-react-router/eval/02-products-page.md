---
name: React Router - Products page
---

## story

As a shopper, I want the products page to support filtering and sorting through URL state,
so that I can narrow the catalog and share the current view.

## acceptance criteria

- [ ] When I navigate to the Products page, then the URL ends with "/products" and I see the heading "Products".
- [ ] When the Products page loads, then I see the controls "Category Filter", "Sort By", and "In Stock Only".
- [ ] When I change "Sort By" to "Price (High to Low)", then the URL contains `sort=price-desc`.
- [ ] When I enable "In Stock Only", then the URL contains `inStock=true` and a "Clear Filters" button becomes visible.
- [ ] When filters are applied, then the product summary remains visible and at least one "View Details" button is still available.
- [ ] When I use "Clear Filters", then I return to the base Products route without search parameters.