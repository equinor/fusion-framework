import { layout, index, route } from '@equinor/fusion-framework-react-router/routes';

export const routes = layout(import.meta.resolve('./pages/Navigation.tsx'), [
  index(import.meta.resolve('./pages/HomePage.tsx')),
  route('avatar/*', import.meta.resolve('./pages/AvatarPage.tsx')),
  route('card/*', import.meta.resolve('./pages/CardPage.tsx')),
  route('list-item/*', import.meta.resolve('./pages/ListItemPage.tsx')),
  route('selector/*', import.meta.resolve('./pages/SelectorPage.tsx')),
]);

export default routes;
