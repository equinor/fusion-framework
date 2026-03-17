---
name: React Router - Product detail page
---

## story

As a shopper, I want the product detail page to preserve view state in the URL,
so that I can deep-link into details, specifications, and reviews.

## acceptance criteria

- [ ] When I open the Products page and click the first visible "View Details" button, then the URL matches `/products/:id`.
- [ ] When the product detail page loads, then I see the selected product name, category, price, stock status, and a link back to Products.
- [ ] When the product detail page loads, then the default view shows the "Product Information" section.
- [ ] When I click "Specifications", then the URL contains `view=specs` and the "Specifications" section is visible.
- [ ] When I click "Reviews", then the URL contains `view=reviews` and review content is visible.
- [ ] When I click "Positive" inside the reviews view, then the URL contains `tab=positive` and the active review tab is reflected in the route information.