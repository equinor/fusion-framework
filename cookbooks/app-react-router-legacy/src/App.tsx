import { Router } from '@equinor/fusion-framework-react-router';
import routes from './routes';

export default function App() {
  return <Router routes={routes} />;
}
