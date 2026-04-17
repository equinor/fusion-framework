import { Router } from '@equinor/fusion-framework-react-router';
import routes from './routes';

/**
 * Application shell that delegates all rendering to the framework router.
 *
 * Route definitions are declared in {@link routes} and lazily resolve
 * page components under `pages/`.
 */
export default function App() {
  return <Router routes={routes} />;
}
