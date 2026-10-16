import { layout, route } from '@equinor/fusion-framework-react-router/routes';

// Route modules declare their role requirements as `middleware` exports, exactly as apps do.
export const routes = layout('./RolesLayout.tsx', [route('reports', './RolesReportsPage.tsx')]);
