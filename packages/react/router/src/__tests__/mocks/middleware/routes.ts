import { layout, route } from '@equinor/fusion-framework-react-router/routes';

// Explicit DSL routes; the Vite plugin compiles these into route objects that carry each
// route module's `middleware` export.
export const routes = layout('./GuardedLayout.tsx', [
  route('reports', './ReportsPage.tsx'),
  route('open', './OpenPage.tsx'),
]);
