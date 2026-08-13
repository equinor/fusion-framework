import { faker } from '@faker-js/faker';
import type { Product } from '../api/ProductApi';
import type { User } from '../api/UserApi';

/** Category names used across the seeded product catalogue. */
export const productCategories = [
  'electronics',
  'furniture',
  'clothing',
  'books',
  'sports',
  'home',
  'toys',
] as const;

/** Role names used across the seeded user directory. */
export const userRoles = ['Developer', 'Designer', 'Manager', 'Analyst'] as const;

/** Department names used across the seeded user directory. */
export const userDepartments = ['Engineering', 'Design', 'Operations', 'Finance'] as const;

/** Office locations used across the seeded user directory. */
export const userLocations = [
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
] as const;

/**
 * Generates one deterministic product from its numeric identifier.
 * @param id - The product's identifier, also used as the faker seed.
 * @returns A seeded product, stable across processes and test runs.
 */
export function generateProduct(id: number): Product {
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
 * Generates a deterministic product catalogue using Faker.js, seeded per product.
 * @param count - The number of products to generate.
 * @returns Zero-based, consistently seeded product records.
 */
export function generateProducts(count: number = 100): Product[] {
  // Create deterministic product records for each requested index.
  return Array.from({ length: count }).map((_, index) => generateProduct(index));
}

/**
 * Generates one deterministic user from its numeric identifier.
 * @param id - The user's identifier, also used (offset) as the faker seed.
 * @returns A seeded user, stable across processes and test runs.
 */
export function generateUser(id: number): User {
  faker.seed(id + 1000); // Use different seed range than products
  const role = faker.helpers.arrayElement(userRoles);
  const department = faker.helpers.arrayElement(userDepartments);
  const location = faker.helpers.arrayElement(userLocations);

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
 * Generates a deterministic user directory using Faker.js, seeded per user.
 * @param count - The number of users to generate.
 * @returns One-based, consistently seeded user records.
 */
export function generateUsers(count: number = 50): User[] {
  // Create deterministic user records with one-based IDs for the mock API.
  return Array.from({ length: count }).map((_, index) => generateUser(index + 1));
}
