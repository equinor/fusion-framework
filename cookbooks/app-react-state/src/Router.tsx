import { Router as FusionRouter } from '@equinor/fusion-framework-react-router';

import routes from './routes/routes';

/** Renders the application's route tree via the Fusion navigation module. */
export default function Router() {
  return <FusionRouter routes={routes} />;
}
