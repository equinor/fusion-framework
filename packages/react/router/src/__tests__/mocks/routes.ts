import { fileURLToPath } from 'node:url';

import { route } from '../../routes/Route';
import { index } from '../../routes/IndexRoute';
import { layout } from '../../routes/LayoutRoute';
import { prefix } from '../../routes/PrefixRoute';

import type { RouteNode } from '../../types';

const resolvePath = (path: string) => fileURLToPath(new URL(path, import.meta.url));

/**
 * Mock route definitions for testing.
 * These provide reusable route fixtures that can be used across multiple test files.
 * Each route references actual component files to test lazy loading functionality.
 */

/**
 * Simple home route
 */
export const mockHomeRoute = route('home', resolvePath('./pages/HomePage.tsx'));

/**
 * Simple about route
 */
export const mockAboutRoute = route('about', resolvePath('./pages/AboutPage.tsx'));

/**
 * Product route with params
 */
export const mockProductRoute = route('product/:id', resolvePath('./pages/ProductPage.tsx'));

/**
 * Product route with params and search
 */
export const mockProductRouteWithSearch = route(
  'product/:id',
  resolvePath('./pages/ProductPage.tsx'),
);

/**
 * Products list route with search params
 */
export const mockProductsRoute = route('products', resolvePath('./pages/ProductsPage.tsx'));

/**
 * Index route at root
 */
export const mockIndexRoute = index(resolvePath('./pages/HomePage.tsx'));

/**
 * Index route with search params
 */
export const mockIndexRouteWithSearch = index(resolvePath('./pages/DashboardPage.tsx'));

/**
 * Prefix route with product children
 */
export const mockProductsPrefix = prefix('products', [
  route(':id', resolvePath('./pages/ProductPage.tsx')),
]);

/**
 * API prefix with multiple routes
 */
export const mockApiPrefix = prefix('api', [
  route('users', resolvePath('./pages/UsersPage.tsx')),
  route('posts', resolvePath('./pages/PostsPage.tsx')),
]);

/**
 * Nested prefix routes
 */
export const mockNestedPrefixes = prefix('api', [
  prefix('v1', [route('users', resolvePath('./pages/UsersPage.tsx'))]),
  prefix('v2', [route('users', resolvePath('./pages/UsersPage.tsx'))]),
]);

/**
 * Layout route with children
 */
export const mockLayoutRoute = layout(resolvePath('./pages/MainLayout.tsx'), [
  index(resolvePath('./pages/HomePage.tsx')),
  route('about', resolvePath('./pages/AboutPage.tsx')),
]);

/**
 * Complex nested route structure matching README example
 */
export const mockComplexRoutes: RouteNode[] = [
  index(resolvePath('./pages/HomePage.tsx')),
  route('products', resolvePath('./pages/ProductsPage.tsx')),
  route('product/:id', resolvePath('./pages/ProductPage.tsx')),
];

/**
 * Layout with prefix and nested routes
 */
export const mockLayoutWithPrefix = layout(resolvePath('./pages/MainLayout.tsx'), [
  index(resolvePath('./pages/HomePage.tsx')),
  prefix('products', [
    index(resolvePath('./pages/ProductsPage.tsx')),
    route(':id', resolvePath('./pages/ProductPage.tsx')),
  ]),
]);

/**
 * Route with nested children
 */
export const mockRouteWithChildren = route('products', resolvePath('./pages/ProductsPage.tsx'), [
  route(':id', resolvePath('./pages/ProductPage.tsx')),
]);

/**
 * Route with handle override - description override
 */
export const mockHomeRouteWithOverride = route('home', resolvePath('./pages/HomePage.tsx'), [], {
  description: 'Custom home page description',
});

/**
 * Route with handle override - additional params
 */
export const mockProductRouteWithOverride = route(
  'product/:id',
  resolvePath('./pages/ProductPage.tsx'),
  [],
  {
    description: 'Custom product description',
    params: {
      id: 'Custom product identifier description',
    },
  },
);

/**
 * Route with handle override - additional search params
 */
export const mockProductsRouteWithOverride = route(
  'products',
  resolvePath('./pages/ProductsPage.tsx'),
  [],
  {
    description: 'Custom products list description',
    search: {
      page: 'Page number for pagination',
      limit: 'Number of items per page',
    },
  },
);

/**
 * Route with handle override - partial override (only description)
 */
export const mockAboutRouteWithOverride = route('about', resolvePath('./pages/AboutPage.tsx'), [], {
  description: 'Custom about page description',
});

/**
 * Index route with handle override
 */
export const mockIndexRouteWithOverride = index(resolvePath('./pages/HomePage.tsx'), {
  description: 'Custom index route description',
});

/**
 * Route with handle override - complete override with all fields
 */
export const mockProductRouteCompleteOverride = route(
  'product/:id',
  resolvePath('./pages/ProductPage.tsx'),
  [],
  {
    description: 'Complete override description',
    params: {
      id: 'Complete override param description',
    },
    search: {
      view: 'Complete override search param',
    },
  },
);

/**
 * Layout route with handle override
 */
export const mockLayoutRouteWithOverride = layout(
  resolvePath('./pages/MainLayout.tsx'),
  [
    index(resolvePath('./pages/HomePage.tsx'), {
      description: 'Custom home in layout',
    }),
    route('about', resolvePath('./pages/AboutPage.tsx'), [], {
      description: 'Custom about in layout',
    }),
  ],
);

/**
 * Prefix route with children having handle overrides
 */
export const mockPrefixWithOverrides = prefix('api', [
  route('users', resolvePath('./pages/UsersPage.tsx'), [], {
    description: 'Custom users description',
  }),
  route('posts', resolvePath('./pages/PostsPage.tsx'), [], {
    description: 'Custom posts description',
    search: {
      category: 'Post category filter',
    },
  }),
]);

/**
 * Route with method chaining override - description only
 */
export const mockRouteWithMethodChaining = route(
  'home',
  resolvePath('./pages/HomePage.tsx'),
).description('Method chaining description override');

/**
 * Route with method chaining override - multiple methods
 */
export const mockProductRouteWithMethodChaining = route(
  'product/:id',
  resolvePath('./pages/ProductPage.tsx'),
)
  .description('Method chaining product description')
  .params({
    id: 'Method chaining param description',
  })
  .search({
    view: 'Method chaining search param',
  });

/**
 * Route with method chaining override - description only (no params)
 */
export const mockAboutRouteWithMethodChaining = route(
  'about',
  resolvePath('./pages/AboutPage.tsx'),
).description('Method chaining about description');

/**
 * Index route with method chaining override
 */
export const mockIndexRouteWithMethodChaining = index(resolvePath('./pages/HomePage.tsx')).description(
  'Method chaining index description',
);

/**
 * Route with method chaining in nested structure
 */ 
export const mockNestedRouteWithMethodChaining = route('products', resolvePath('./pages/ProductsPage.tsx'), [
  route(':id', resolvePath('./pages/ProductPage.tsx')).description('Method chaining nested route description'),
]);


