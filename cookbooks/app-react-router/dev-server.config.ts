import { defineDevServerConfig } from '@equinor/fusion-framework-cli/dev-server';
import { faker } from '@faker-js/faker';
import type { Product } from './src/api/ProductApi';
import type { User } from './src/api/UserApi';

const productCategories = [
  'electronics',
  'furniture',
  'clothing',
  'books',
  'sports',
  'home',
  'toys',
];

/**
 * Generate a single product
 */
function generateProduct(id: number): Product {
  faker.seed(id);
  const category = faker.helpers.arrayElement(productCategories);

  return {
    id,
    name: faker.commerce.productName(),
    category,
    price: parseFloat(faker.commerce.price({ min: 10, max: 2000, dec: 2 })),
    description: faker.commerce.productDescription(),
    inStock: faker.datatype.boolean({ probability: 0.8 }),
    reviews: faker.number.int({ min: 0, max: 500 }),
    rating: parseFloat(faker.number.float({ min: 3.0, max: 5.0, fractionDigits: 1 }).toFixed(1)),
    image: faker.image.url({ width: 300, height: 175 }),
  };
}

/**
 * Generate mock products using Faker.js
 * Using a seed ensures consistent data across runs
 */
function generateProducts(count: number = 100): Product[] {
  return Array.from({ length: count }).map((_, index) => generateProduct(index));
}

/**
 * Generate a single user
 */
function generateUser(id: number): User {
  faker.seed(id + 1000); // Use different seed range than products
  const role = faker.helpers.arrayElement(['Developer', 'Designer', 'Manager', 'Analyst']);
  const department = faker.helpers.arrayElement(['Engineering', 'Design', 'Operations', 'Finance']);
  const location = faker.helpers.arrayElement([
    'Oslo',
    'Bergen',
    'Trondheim',
    'Stavanger',
    'Tromsø',
    'Kristiansand',
    'Ålesund',
    'Bodø',
    'Drammen',
    'Sandnes',
    'Fredrikstad',
    'Tønsberg',
  ]);

  return {
    id,
    name: faker.person.fullName(),
    email: faker.internet.email().toLowerCase(),
    role,
    department,
    phone: `+47 ${faker.string.numeric(3)} ${faker.string.numeric(2)} ${faker.string.numeric(3)}`,
    location,
    joinDate: faker.date.past({ years: 5 }).toISOString().split('T')[0],
  };
}

/**
 * Generate mock users using Faker.js
 * Using a seed ensures consistent data across runs
 */
function generateUsers(count: number = 50): User[] {
  return Array.from({ length: count }).map((_, index) => generateUser(index + 1));
}

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
