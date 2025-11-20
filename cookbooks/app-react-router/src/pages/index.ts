import { index, route, prefix } from '@equinor/fusion-framework-react-router/routes';

export const pages = [
  index('./HomePage.tsx'),
  prefix('products', [
    index('./ProductsPage.tsx'),
    route(':id', './ProductPage.tsx'),
  ]),
  prefix('users', [
    index('./UsersPage.tsx'),
    route(':id', './UserPage.tsx'),
  ]),
  prefix('pages', [
    route('people', './PeoplePage.tsx'),
    route('error-test', './ErrorTestPage.tsx'),
  ]),
];
