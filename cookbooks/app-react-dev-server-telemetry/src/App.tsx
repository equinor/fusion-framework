import type { ReactElement } from 'react';

import { Router } from '@equinor/fusion-framework-react-router';

import routes from './routes';

/**
 * Renders the cookbook routes. The router navigates through the app's navigation module, which
 * reports each navigation to telemetry without route paths, search parameters or state.
 * @returns The routed cookbook application.
 * @example
 * ```tsx
 * <App />
 * ```
 */
export const App = (): ReactElement => <Router routes={routes} />;

export default App;
