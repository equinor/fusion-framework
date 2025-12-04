import { Router } from '@equinor/fusion-framework-react-router';

import routes from './Routes';

export default function () {
  return <Router routes={routes} />;
}
