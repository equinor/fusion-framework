import { layout, index, route } from '@equinor/fusion-framework-react-router/routes';

export const routes = layout(import.meta.resolve('./Root.tsx'), [
  index(import.meta.resolve('./Selected.tsx')),
  route('page1/*', import.meta.resolve('./Page1.tsx')),
  route('page2/*', import.meta.resolve('./Page2.tsx')),
]);

export default routes;
