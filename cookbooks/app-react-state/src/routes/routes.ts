import { index, layout, route } from '@equinor/fusion-framework-react-router/routes';

export const pages = [
  index('./index.tsx'),
  route('basics/*', './basics/index.tsx'),
  route('profile/*', './profile/index.tsx'),
  route('todos/*', './todos/index.tsx'),
];

export const routes = layout('./layout.tsx', pages);

export default routes;
