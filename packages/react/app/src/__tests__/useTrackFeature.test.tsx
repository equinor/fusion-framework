import { describe, expect, it } from 'vitest';

import { mockFramework } from '@equinor/fusion-framework/mock';
import { enableAppManifestMock } from '@equinor/fusion-framework-app/mock';
import type { AppModule } from '@equinor/fusion-framework-module-app';
import { enableAnalytics, type AnalyticsModule } from '@equinor/fusion-framework-module-analytics';
import { MockAnalyticsAdapter } from '@equinor/fusion-framework-module-analytics/mock';
import type { MockTelemetryAdapter } from '@equinor/fusion-framework-module-telemetry/mock';

import { useTrackFeature } from '../analytics/useTrackFeature';
import { renderAppHook } from '../vitest/render-app-hook';

const env = {
  manifest: {
    appKey: 'test-app',
    displayName: 'Test App',
    description: 'A test application',
    type: 'standalone' as const,
  },
};

describe('useTrackFeature', () => {
  it('tracks an app-feature analytics event carrying the current app’s key, leaving telemetry untouched', async () => {
    const recorder = new MockAnalyticsAdapter();

    const fusion = await mockFramework<[AppModule, AnalyticsModule]>((configurator) => {
      enableAppManifestMock(configurator, env);
      enableAnalytics(configurator, (builder) => {
        builder.setAdapter('mock', async () => recorder);
      });
    });
    fusion.modules.app.setCurrentApp('test-app');

    const { result } = await renderAppHook(() => useTrackFeature(), { env, fusion });
    result.current('button-click', { section: 'header' });

    // analytics is the only channel a successful call should reach
    expect(recorder.getAnalytics()).toMatchObject([
      {
        name: 'app-feature',
        value: { feature: 'button-click', data: { section: 'header' } },
        attributes: { appKey: 'test-app', context: undefined },
      },
    ]);
    // the framework logs its own telemetry regardless; the fallback diagnostic
    // specifically must not fire when analytics was reached successfully
    const telemetry = fusion.modules.telemetry.getAdapter('mock') as MockTelemetryAdapter;
    expect(telemetry.getItems('AnalyticsProviderNotFound')).toHaveLength(0);
  });

  it('includes the current context alongside the app key', async () => {
    const recorder = new MockAnalyticsAdapter();
    const project = { id: 'ctx-1', title: 'My project', type: { id: 'ProjectMaster' }, value: {} };

    const fusion = await mockFramework<[AppModule, AnalyticsModule]>((configurator) => {
      enableAppManifestMock(configurator, env);
      enableAnalytics(configurator, (builder) => {
        builder.setAdapter('mock', async () => recorder);
      });
      configurator.context.setCurrentContext(project);
    });

    const { result } = await renderAppHook(() => useTrackFeature(), { env, fusion });
    result.current('button-click');

    const [event] = recorder.getAnalytics('app-feature');
    expect(event.attributes?.context).toMatchObject({ id: project.id, type: 'ProjectMaster' });
  });

  it('reports to telemetry instead of throwing when no analytics provider is registered', async () => {
    const fusion = await mockFramework<[AppModule]>((configurator) => {
      enableAppManifestMock(configurator, env);
    });

    const { result } = await renderAppHook(() => useTrackFeature(), { env, fusion });

    // the missing-analytics diagnostic is a telemetry concern, not an analytics one —
    // it must not throw and must not fabricate an analytics event of its own
    expect(() => result.current('button-click')).not.toThrow();
    const telemetry = fusion.modules.telemetry.getAdapter('mock') as MockTelemetryAdapter;
    expect(telemetry.getItems('AnalyticsProviderNotFound')).toHaveLength(1);
  });
});
