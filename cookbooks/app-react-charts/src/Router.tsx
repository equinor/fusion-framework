import { Router } from '@equinor/fusion-framework-react-router';

import routes from './routes';

export default function () {
  return <Router routes={routes} />;
}
