import { useTrackFeature } from '@equinor/fusion-framework-react-app/analytics';
import { useLocation } from '@equinor/fusion-framework-react-router';
import { useEffect } from 'react';

/**
 * Tracks a `page-viewed` app feature with the route each time the app's route changes, so usage
 * analytics show which pages people open.
 *
 * @remarks
 * The route is the path inside the app (`/people`), not the portal URL. In mocked runs the dev
 * portal sends the event to `ffc mock-server`, where Playwright reads it with
 * `createMockAnalytics().waitFor(request, { feature: 'page-viewed' })`.
 *
 * @example
 * ```tsx
 * export default function Layout() {
 *   usePageViewTracking();
 *   return <Outlet />;
 * }
 * ```
 */
export function usePageViewTracking(): void {
  const { pathname } = useLocation();
  const trackFeature = useTrackFeature();

  useEffect(() => {
    trackFeature('page-viewed', { route: pathname });
  }, [pathname, trackFeature]);
}

export default usePageViewTracking;
