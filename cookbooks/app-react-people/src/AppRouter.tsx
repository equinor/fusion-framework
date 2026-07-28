import { Router } from '@equinor/fusion-framework-react-router';

import routes from './routes';

/**
 * Renders the cookbook's route tree inside the Fusion router.
 *
 * @returns The configured router for the people component examples.
 */
export const AppRouter = () => {
  return <Router routes={routes} />;
};
