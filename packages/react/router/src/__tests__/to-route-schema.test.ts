import { describe, it, expect } from 'vitest';
import type { RouteObject } from '../types';

import { toRouteSchema } from '../routes/to-route-schema';
import { route } from '../routes/Route';
import { prefix } from '../routes/PrefixRoute';
import {
  mockHomeRoute,
  mockProductRoute,
  mockProductRouteWithSearch,
  mockProductsRoute,
  mockIndexRoute,
  mockProductsPrefix,
  mockLayoutRoute,
  mockLayoutWithPrefix,
  mockProductRouteCompleteOverride,
  mockProductRouteWithMethodChaining,
} from './mocks/routes';

describe('toRouteSchema', () => {
  describe('simple routes', () => {
    it('should convert a single route with description', async () => {
      const schema = await toRouteSchema(mockHomeRoute);

      expect(schema).toEqual([['home', 'Home page of application']]);
    });

    it('should convert a route without description', async () => {
      const routes = route('about', './about.tsx');

      const schema = await toRouteSchema(routes);

      expect(schema).toEqual([['about', '']]);
    });
  });

  describe('routes with parameters', () => {
    it('should convert a route with params', async () => {
      const schema = await toRouteSchema(mockProductRoute);

      expect(schema).toEqual([
        [
          'product/:id',
          'Details of a product',
          {
            params: { id: 'identifier of the product' },
            search: {
              sort: 'asc (default), desc for descending',
              'filter.type': 'Product type to filter by',
            },
          },
        ],
      ]);
    });
  });

  describe('routes with search parameters', () => {
    it('should convert a route with search params', async () => {
      const schema = await toRouteSchema(mockProductsRoute);

      expect(schema).toEqual([
        [
          'products',
          'Product list page',
          {
            search: {
              sort: 'asc (default), desc for descending',
              filter: 'Filter by category',
            },
          },
        ],
      ]);
    });
  });

  describe('routes with both params and search', () => {
    it('should convert a route with both params and search', async () => {
      const schema = await toRouteSchema(mockProductRouteWithSearch);

      expect(schema).toEqual([
        [
          'product/:id',
          'Details of a product',
          {
            params: { id: 'identifier of the product' },
            search: {
              sort: 'asc (default), desc for descending',
              'filter.type': 'Product type to filter by',
            },
          },
        ],
      ]);
    });
  });

  describe('index routes', () => {
    it('should convert an index route at root', async () => {
      const schema = await toRouteSchema(mockIndexRoute);

      expect(schema).toEqual([['/', 'Home page of application']]);
    });
  });

  describe('prefix routes', () => {
    it('should prefix child routes', async () => {
      const schema = await toRouteSchema(mockProductsPrefix);

      expect(schema).toEqual([
        [
          'products/:id',
          'Details of a product',
          {
            params: { id: 'identifier of the product' },
            search: {
              sort: 'asc (default), desc for descending',
              'filter.type': 'Product type to filter by',
            },
          },
        ],
      ]);
    });
  });

  describe('layout routes', () => {
    it('should process children of layout routes', async () => {
      const schema = await toRouteSchema(mockLayoutRoute);

      expect(schema).toEqual([
        ['/', 'Home page of application'],
        ['about', 'About page'],
      ]);
    });
  });

  describe('nested routes', () => {
    it('should handle complex nested structure', async () => {
      const schema = await toRouteSchema(mockLayoutWithPrefix);

      expect(schema).toEqual([
        ['/', 'Home page of application'],
        [
          'products',
          'Product list page',
          {
            search: {
              sort: 'asc (default), desc for descending',
              filter: 'Filter by category',
            },
          },
        ],
        [
          'products/:id',
          'Details of a product',
          {
            params: { id: 'identifier of the product' },
            search: {
              sort: 'asc (default), desc for descending',
              'filter.type': 'Product type to filter by',
            },
          },
        ],
      ]);
    });
  });

  describe('edge cases', () => {
    it('should handle empty array', async () => {
      const schema = await toRouteSchema([]);

      expect(schema).toEqual([]);
    });

    it('should handle route without schema', async () => {
      const routes = route('test', './test.tsx');

      const schema = await toRouteSchema(routes);

      expect(schema).toEqual([['test', '']]);
    });

    it('should handle paths with leading/trailing slashes', async () => {
      const routes = prefix('/api/', [
        route('/users/', './users.tsx', [], { description: 'Users' }),
      ]);

      const schema = await toRouteSchema(routes);

      expect(schema).toEqual([['api/users', 'Users']]);
    });
  });

  describe('schema overrides', () => {
    it('should override module schema with route-level schema', async () => {
      const schema = await toRouteSchema(mockProductRouteCompleteOverride);

      expect(schema).toEqual([
        [
          'product/:id',
          'Complete override description',
          {
            params: { id: 'Complete override param description' },
            search: { view: 'Complete override search param' },
          },
        ],
      ]);
    });
  });

  describe('method chaining overrides', () => {
    it('should override schema using method chaining', async () => {
      const schema = await toRouteSchema(mockProductRouteWithMethodChaining);

      expect(schema).toEqual([
        [
          'product/:id',
          'Method chaining product description',
          {
            params: { id: 'Method chaining param description' },
            search: { view: 'Method chaining search param' },
          },
        ],
      ]);
    });
  });

  describe('legacy RouteObject[] format', () => {
    it('should convert basic RouteObject array', async () => {
      const legacyRoutes: RouteObject[] = [
        {
          path: 'home',
          handle: {
            route: {
              description: 'Home page of application',
            },
          },
        },
        {
          path: 'product/:id',
          handle: {
            route: {
              description: 'Details of a product',
              params: {
                id: 'identifier of the product',
              },
              search: {
                sort: 'asc (default), desc for descending',
                'filter.type': 'Product type to filter by',
              },
            },
          },
        },
      ];

      const schema = await toRouteSchema(legacyRoutes);

      expect(schema).toEqual([
        ['home', 'Home page of application'],
        [
          'product/:id',
          'Details of a product',
          {
            params: { id: 'identifier of the product' },
            search: {
              sort: 'asc (default), desc for descending',
              'filter.type': 'Product type to filter by',
            },
          },
        ],
      ]);
    });

    it('should handle nested RouteObject structure', async () => {
      const legacyRoutes: RouteObject[] = [
        {
          index: true,
          handle: {
            route: {
              description: 'Home page of application',
            },
          },
        },
        {
          path: 'products',
          handle: {
            route: {
              description: 'Product list page',
              search: {
                sort: 'asc (default), desc for descending',
                filter: 'Filter by category',
              },
            },
          },
          children: [
            {
              path: ':id',
              handle: {
                route: {
                  description: 'Details of a product',
                  params: {
                    id: 'identifier of the product',
                  },
                  search: {
                    sort: 'asc (default), desc for descending',
                    'filter.type': 'Product type to filter by',
                  },
                },
              },
            },
          ],
        },
        {
          handle: {
            route: {
              description: 'Main layout',
            },
          },
          children: [
            {
              path: 'about',
              handle: {
                route: {
                  description: 'About page',
                },
              },
            },
          ],
        },
      ];

      const schema = await toRouteSchema(legacyRoutes);

      expect(schema).toEqual([
        ['/', 'Home page of application'],
        [
          'products',
          'Product list page',
          {
            search: {
              sort: 'asc (default), desc for descending',
              filter: 'Filter by category',
            },
          },
        ],
        [
          'products/:id',
          'Details of a product',
          {
            params: { id: 'identifier of the product' },
            search: {
              sort: 'asc (default), desc for descending',
              'filter.type': 'Product type to filter by',
            },
          },
        ],
        ['about', 'About page'],
      ]);
    });
  });
});
