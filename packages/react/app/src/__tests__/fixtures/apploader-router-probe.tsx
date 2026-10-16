import { Router, useLocation, useNavigate } from '@equinor/fusion-framework-react-router';

/** Shows the router-relative pathname and offers a push navigation. */
const Probe = () => {
  const location = useLocation();
  const navigate = useNavigate();
  return (
    <>
      <output data-testid="path">{location.pathname}</output>
      <button type="button" onClick={() => navigate('/clicked')}>
        go
      </button>
    </>
  );
};

const routes = [{ path: '*', Component: Probe }];

/** Real `Router` consuming the navigation module, shared by the loader fixtures. */
export const RouterApp = () => <Router routes={routes} />;
