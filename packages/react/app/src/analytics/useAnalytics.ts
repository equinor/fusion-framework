import { useFrameworkModule } from '@equinor/fusion-framework-react';
import type {
  AnalyticsModule,
  IAnalyticsProvider,
} from '@equinor/fusion-framework-module-analytics';

/**
 * Hook for using analytics module configured in the framework.
 */
export const useAnalytics = (): IAnalyticsProvider | undefined => {
  const analyticsProvider = useFrameworkModule<AnalyticsModule>('analytics');

  if (!analyticsProvider) {
    // @TODO: use telemetry to log that analytics module is not configured?
    console.log('framework does not have the analytics module configured');
    return;
  }

  return {
    /**
     * Tracks a analytics event.
     *
     * @param event - The analytic event to track.
     */
    trackAnalytic: (event) => analyticsProvider.trackAnalytic(event),
    /**
     * Uses a analytics stream and returns both Disposable and Subscription for cleanup.
     *
     * @param analytic$ - Observable input stream of analytic events.
     * @returns Object containing both Disposable and Subscription for proper cleanup.
     */
    trackAnalytic$: (analytic$) => analyticsProvider.trackAnalytic$(analytic$),
  };
};
