import { index, layout, prefix, route } from '@equinor/fusion-framework-react-router/routes';

export const pages = [
  index('./index.tsx'),
  prefix('products', [
    index('./products/index.tsx'),
    route(':id', './products/[id]/index.tsx'),
  ]),
  prefix('users', [index('./users/index.tsx'), route(':id', './users/[id]/index.tsx')]),
  prefix('pages', [
    route('people', './people/index.tsx'),
    route('error-test', './error-test/index.tsx'),
  ]),
];

export const routes = layout('./layout.tsx', pages);

export default routes;
