import { index, route, prefix } from "@equinor/fusion-framework-react-router/routes";

export const pages = [
  index(import.meta.resolve('./HomePage.tsx')),
  prefix('products', [
    index(import.meta.resolve('./ProductsPage.tsx')),
    route(':id', import.meta.resolve('./ProductPage.tsx')),
  ]),
  prefix('users', [
    index(import.meta.resolve('./UsersPage.tsx')),
    route(':id', import.meta.resolve('./UserPage.tsx')),
  ]),
  prefix('pages', [
    route('people', import.meta.resolve('./PeoplePage.tsx')),
    route('error-test', import.meta.resolve('./ErrorTestPage.tsx')),
  ]),
];