import { layout, index, route } from '@equinor/fusion-framework-react-router/routes';

// TODO
// route('people-concepts', './pages/PeopleConceptPage.tsx'),
export const routes = layout('./pages/Navigation.tsx', [
  index('./pages/HomePage.tsx'),
  route('avatar/*', './pages/AvatarPage.tsx'),
  route('card/*', './pages/CardPage.tsx'),
  route('list-item/*', './pages/ListItemPage.tsx'),
  route('selector/*', './pages/SelectorPage.tsx'),
]);

export default routes;
