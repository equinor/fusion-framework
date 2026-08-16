import { defineDevServerConfig } from '@equinor/fusion-framework-cli/dev-server';
import {
  productCategories,
  generateProduct,
  generateProducts,
  generateUser,
  generateUsers,
} from './src/mocks/generators';

export default defineDevServerConfig(() => ({
  spa: {
    templateEnv: {
      telemetry: { consoleLevel: 0 },
    },
  },
  api: {
    routes: [
      {
        match: '/api/products',
        middleware: (_req, res) => {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ products: generateProducts() }));
        },
      },
      {
        match: '/api/products/:id',
        middleware: (req, res) => {
          const productId = parseInt(req.params?.id as string, 10);
          // Reject malformed IDs before generating a response for the requested product.
          if (Number.isNaN(productId) || productId < 0) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Invalid product ID' }));
            return;
          }

          // Generate a single product with the requested ID
          const product = generateProduct(productId);

          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(product));
        },
      },
      {
        match: '/api/categories',
        middleware: (_req, res) => {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ categories: productCategories }));
        },
      },
      {
        match: '/api/users',
        middleware: (req, res) => {
          const url = new URL(req.url || '', 'http://localhost');
          const page = parseInt(url.searchParams.get('page') || '1', 10);
          const limit = parseInt(url.searchParams.get('limit') || '5', 10);

          const allUsers = generateUsers();
          const startIndex = (page - 1) * limit;
          const endIndex = startIndex + limit;
          const paginatedUsers = allUsers.slice(startIndex, endIndex);
          const totalPages = Math.ceil(allUsers.length / limit);

          res.setHeader('Content-Type', 'application/json');
          res.end(
            JSON.stringify({
              users: paginatedUsers,
              page,
              limit,
              total: allUsers.length,
              totalPages,
              hasNext: page < totalPages,
              hasPrev: page > 1,
            }),
          );
        },
      },
      {
        match: '/api/users/:id',
        middleware: (req, res) => {
          const userId = parseInt(req.params?.id as string, 10);
          // Reject malformed IDs before generating a response for the requested user.
          if (Number.isNaN(userId) || userId < 1) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Invalid user ID' }));
            return;
          }

          // Generate a single user with the requested ID
          const user = generateUser(userId);

          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(user));
        },
      },
    ],
  },
}));
