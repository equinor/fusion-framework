import { Router } from '@equinor/fusion-framework-react-router';
import routes from './routes';

/**
 * Provides the legacy route-object configuration to the Fusion router.
 * @returns The legacy router application.
 */
export default function App() {
  return <Router routes={routes} />;
}
