import { Router } from '@equinor/fusion-framework-react-router';

import routes from './routes';

export const AppRouter = () => {
  return <Router routes={routes} />;
};
