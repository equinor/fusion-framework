import { describe, expect, it, vi } from 'vitest';
import { ModulesConfigurator } from '@equinor/fusion-framework-module';
import { Subject } from 'rxjs';

import { enableAnalytics } from '../../enable-analytics.js';
import { ConsoleAnalyticsAdapter } from '../../adapters/ConsoleAnalyticsAdapter.js';
import { MockAnalyticsAdapter } from '../../mock/MockAnalyticsAdapter.js';
import type { IAnalyticsConfigurator } from '../../AnalyticsConfigurator.interface.js';
import type { IAnalyticsProvider } from '../../AnalyticsProvider.interface.js';
import type { AnalyticsEvent } from '../../types.js';

/**
 * Initializes the analytics module through the real module system, with a
 * `MockAnalyticsAdapter` registered alongside whatever the test configures.
 *
 * @remarks
 * Deliberately avoids hand-building an `AnalyticsProvider`. Testing the
 * adapter's own logic in isolation (see `MockAnalyticsAdapter.test.ts`) can't
 * prove it actually receives events through the real configure -> initialize
 * -> collector/adapter dispatch pipeline every other adapter goes through.
 *
 * @param configure - Optional callback to register additional adapters/collectors.
 * @returns The real `IAnalyticsProvider` instance and the recording adapter.
 */
const initializeWith = async (
  configure?: (builder: IAnalyticsConfigurator) => void,
): Promise<{ provider: IAnalyticsProvider; recorder: MockAnalyticsAdapter }> => {
  const recorder = new MockAnalyticsAdapter();
  const configurator = new ModulesConfigurator([]);

  enableAnalytics(configurator, (builder) => {
    builder.setAdapter('mock', async () => recorder);
    configure?.(builder);
  });

  const instances = await configurator.initialize();
  const provider = (instances as unknown as { analytics: IAnalyticsProvider }).analytics;

  return { provider, recorder };
};

describe('MockAnalyticsAdapter (through the real analytics module)', () => {
  it('observes events pushed via provider.trackAnalytic', async () => {
    const { provider, recorder } = await initializeWith();

    provider.trackAnalytic({ name: 'button-click', value: 'save' });

    expect(recorder.getAnalytics('button-click')).toHaveLength(1);
  });

  it('observes events emitted by a real registered collector', async () => {
    const clicks$ = new Subject<AnalyticsEvent>();
    const { recorder } = await initializeWith((builder) => {
      builder.setCollector('clicks', async () => clicks$);
    });

    clicks$.next({ name: 'window-click', value: 42 });

    const event = await recorder.waitForAnalytic('window-click');
    expect(event.value).toBe(42);
  });

  it('does not interfere with other adapters registered alongside it', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    const { provider, recorder } = await initializeWith((builder) => {
      builder.setAdapter('console', async () => new ConsoleAnalyticsAdapter());
    });

    provider.trackAnalytic({ name: 'page-view', value: null });

    expect(recorder.getAnalytics('page-view')).toHaveLength(1);
    expect(logSpy).toHaveBeenCalledWith('Analytics::Adapter::Console', {
      name: 'page-view',
      value: null,
    });

    logSpy.mockRestore();
  });
});
