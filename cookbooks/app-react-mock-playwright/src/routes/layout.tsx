import { Link, Outlet } from '@equinor/fusion-framework-react-router';

import type { ReactElement } from 'react';

/**
 * Provides navigation between the three mock-service lifecycle scenarios.
 *
 * @returns The page shell element.
 *
 * @example
 * The Fusion router renders this layout around the direct-only, merged, and new-service pages.
 */
export default function Layout(): ReactElement {
  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        background: '#f0f0f0',
        color: '#343434',
        padding: '3rem 1.5rem',
        boxSizing: 'border-box',
      }}
    >
      <header style={{ width: 'min(44rem, 100%)', marginBottom: '2rem' }}>
        <h1>Mock service scenarios</h1>
        <nav aria-label="Mock service scenarios" style={{ display: 'flex', gap: '1rem' }}>
          <Link to="/">Direct-only service</Link>
          <Link to="/people">Existing service override</Link>
          <Link to="/aurora">Pre-production service</Link>
        </nav>
      </header>
      <main style={{ width: 'min(44rem, 100%)' }}>
        <Outlet />
      </main>
    </div>
  );
}
