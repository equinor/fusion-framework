import { SideBar, Divider, Typography } from '@equinor/eds-core-react';
import { home, router, swap_horizontal, info_circle } from '@equinor/eds-icons';
import { Outlet, useLocation } from '@equinor/fusion-framework-react-router';

import { useContextNavigation } from '../hooks';
import { useRoutingDiagnostics, useCrossAppNavigation, useStrategySwitch } from '../hooks';
import { getOutsideFrameworkRouteBHref } from '../utils/url';
import { ContextSummary } from './ContextSummary';
import { StrategyButtons } from './StrategyButtons';
import { CrossAppSection } from './CrossAppSection';
import { DiagnosticsDisplay } from './DiagnosticsDisplay';

/** Map route keys to their display labels and navigation paths. */
const NAV_ITEMS = [
  { key: 'home', label: 'Home', icon: home, path: '/' },
  { key: 'route-a', label: 'Route A', icon: router, path: '/route-a' },
  { key: 'route-b', label: 'Route B', icon: router, path: '/route-b' },
] as const;

/**
 * Resolves which nav item is active based on the current app-relative pathname.
 *
 * @param pathname - Application-relative pathname from the router
 * @returns The key of the active nav item
 */
const resolveActiveNav = (pathname: string): string => {
  const segments = pathname.split('/').filter(Boolean);
  const routeSegment = segments.find((s) => s === 'route-a' || s === 'route-b');
  return routeSegment ?? 'home';
};

/**
 * Root layout for the context-routing cookbook.
 *
 * Uses an EDS `SideBar` for route navigation on the left, with the main
 * content area on the right split into four sections:
 * 1. Strategy selector (action bar)
 * 2. Cross-app navigation testing
 * 3. Routed page content (`<Outlet />`)
 * 4. Diagnostics panel
 */
export default function Layout() {
  const { navigateTo } = useContextNavigation();
  const location = useLocation();
  const activeNav = resolveActiveNav(location.pathname);
  const diagnostics = useRoutingDiagnostics();
  const { navigateToApp } = useCrossAppNavigation();
  const { setRoutingStrategy, removeContextFromUrl } = useStrategySwitch();

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', minHeight: '100%' }}>
      {/* ── Left: EDS SideBar ── */}
      <SideBar>
        <SideBar.Content>
          <SideBar.Toggle />
          {NAV_ITEMS.map((item) => (
            <SideBar.Link
              key={item.key}
              label={item.label}
              icon={item.icon}
              active={activeNav === item.key}
              onClick={() => navigateTo(item.path)}
            />
          ))}
        </SideBar.Content>
        <SideBar.Footer>
          <Divider size="2" color="light" style={{ marginBlock: 0 }} />
          <SideBar.Link
            label="Cross-app"
            icon={swap_horizontal}
            onClick={() => {
              const el = document.getElementById('cross-app-section');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
          />
          <SideBar.Link
            label="Diagnostics"
            icon={info_circle}
            onClick={() => {
              const el = document.getElementById('diagnostics-section');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
          />
        </SideBar.Footer>
      </SideBar>

      {/* ── Right: main content area ── */}
      <div
        style={{
          display: 'grid',
          gap: '1.5rem',
          padding: '1.5rem 2rem',
          alignContent: 'start',
          overflowY: 'auto',
        }}
      >
        {/* Header */}
        <div>
          <Typography variant="h2">Context Routing Cookbook</Typography>
          <Typography variant="body_short" style={{ marginTop: '0.25rem', color: '#6f6f6f' }}>
            Select a context in the portal, switch routing strategies, and verify URL
            synchronisation across routes.
          </Typography>
        </div>

        {/* Section 1: Strategy selector */}
        <StrategyButtons
          activeStrategy={diagnostics.strategy}
          onStrategyChange={setRoutingStrategy}
          hardNavigateHref={getOutsideFrameworkRouteBHref(location.pathname)}
          onRemoveContext={removeContextFromUrl}
        />

        {/* Section 2: Context summary + routed page */}
        <div style={{ display: 'grid', gap: '1rem' }}>
          <ContextSummary />
          <Divider color="light" />
          <Outlet />
        </div>

        {/* Section 3: Cross-app navigation */}
        <div id="cross-app-section">
          <CrossAppSection navigateToApp={navigateToApp} />
        </div>

        {/* Section 4: Diagnostics */}
        <div id="diagnostics-section">
          <DiagnosticsDisplay diagnostics={diagnostics} />
        </div>
      </div>
    </div>
  );
}
