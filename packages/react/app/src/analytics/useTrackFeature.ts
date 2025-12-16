import { useFrameworkModule } from '@equinor/fusion-framework-react';
import type { AppModule } from '@equinor/fusion-framework-module-app';
import type { AnalyticsModule } from '@equinor/fusion-framework-module-analytics';
import { useCallback } from 'react';

/**
 * Hook for using analytics module configured in the framework.
 */
export const useTrackFeature = () => {
  const analyticsProvider = useFrameworkModule<AnalyticsModule>('analytics');
  const appProvider = useFrameworkModule<AppModule>('app');
  const contextProvider = useFrameworkModule('context');
  const telemetryProvider = useFrameworkModule('telemetry');

  /**
   * Tracks a analytics event.
   *
   * @param name - The feature to track
   */
  const trackFeature = useCallback(
    (name: string) => {
      if (!analyticsProvider) {
        telemetryProvider?.trackException({
          name: 'AnalyticsProviderNotFound',
          exception: new Error(`Analytics provider not found`),
        });
      }

      analyticsProvider?.trackAnalytic({
        name: 'app-feature',
        value: {
          feature: name,
        },
        attributes: {
          appKey: appProvider?.current?.appKey,
          context: contextProvider?.currentContext
            ? {
                id: contextProvider.currentContext.id,
                externalId: contextProvider.currentContext.externalId,
                title: contextProvider.currentContext.title,
                type: contextProvider.currentContext.type.id,
                source: contextProvider.currentContext.source,
              }
            : undefined,
        },
      });
    },
    [analyticsProvider, appProvider, contextProvider, telemetryProvider],
  );

  return trackFeature;
};
