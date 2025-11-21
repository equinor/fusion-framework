import { layout } from '@equinor/fusion-framework-react-router/routes';

import { pages } from './pages';

export const routes = layout(import.meta.resolve('./Layout.tsx'), pages);

export default routes;
