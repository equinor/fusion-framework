import { faker } from '@faker-js/faker';
import type { FieldFakerMap } from '@equinor/fusion-openapi-mock';
import { productCategories, userRoles, userDepartments, userLocations } from './generators';

/**
 * Field-level fakers for the `Product`/`User` schemas in {@link ./openapi.json}, reusing the
 * same generators as `generateProduct`/`generateUser` so the baseline (non-overridden) faked
 * fields look like the deterministic catalogue/directory those functions produce.
 */
export default {
  'Product.name': 'commerce.productName',
  'Product.category': () => faker.helpers.arrayElement(productCategories),
  'Product.price': () => parseFloat(faker.commerce.price({ min: 10, max: 2000, dec: 2 })),
  'Product.description': 'commerce.productDescription',
  'Product.inStock': () => faker.datatype.boolean({ probability: 0.8 }),
  'Product.reviews': () => faker.number.int({ min: 0, max: 500 }),
  'Product.rating': () => parseFloat(faker.number.float({ min: 3.0, max: 5.0, fractionDigits: 1 }).toFixed(1)),
  'Product.image': () => faker.image.url({ width: 300, height: 175 }),
  'User.name': 'person.fullName',
  'User.email': () => faker.internet.email().toLowerCase(),
  'User.role': () => faker.helpers.arrayElement(userRoles),
  'User.department': () => faker.helpers.arrayElement(userDepartments),
  'User.phone': () => `+47 ${faker.string.numeric(3)} ${faker.string.numeric(2)} ${faker.string.numeric(3)}`,
  'User.location': () => faker.helpers.arrayElement(userLocations),
  'User.joinDate': () => faker.date.past({ years: 5 }).toISOString().split('T')[0],
} satisfies FieldFakerMap;
