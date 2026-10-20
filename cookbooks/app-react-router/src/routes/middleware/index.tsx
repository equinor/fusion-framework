import type { ReactElement } from 'react';
import { home } from '@equinor/eds-icons';
import { Link, useSearchParams } from '@equinor/fusion-framework-react-router';

export const handle = {
  route: {
    title: 'Middleware Demo',
    icon: home,
    description: 'Explicit routes with shared guards, typed context and telemetry',
  },
};

/**
 * Offers reproducible access outcomes without requiring a live identity service.
 * @returns Demo links and an explicit warning about client-controlled state.
 */
export default function MiddlewareDemo(): ReactElement {
  const [search] = useSearchParams();
  const denied = search.has('denied');

  return (
    <section>
      <h2>Middleware demo</h2>
      <p>
        Query-string access is demonstration state, not authentication or authorization. Production
        apps must check their configured access provider and enforce access on the backend.
      </p>
      {denied && <p role="status">Demo access denied; redirected before the report loader.</p>}
      <ul>
        <li>
          <Link to="/middleware/reports/first?access=allow">Allow report</Link>
        </li>
        <li>
          <Link to="/middleware/reports/first?access=deny">Deny report</Link>
        </li>
        <li>
          <Link to="/middleware/reports/first?access=error">Fail access check</Link>
        </li>
      </ul>
    </section>
  );
}
