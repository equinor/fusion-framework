/**
 * Mock analytics adapter for tests: records tracked events in-memory instead
 * of exporting them to a backend.
 *
 * @remarks
 * Register it like any other {@link IAnalyticsAdapter} via
 * {@link IAnalyticsConfigurator.setAdapter} — it observes tracked events
 * alongside real adapters without affecting their delivery.
 *
 * @example
 * ```ts
 * import { MockAnalyticsAdapter } from '@equinor/fusion-framework-module-analytics/mock';
 *
 * const recorder = new MockAnalyticsAdapter();
 * enableAnalytics(configurator, (builder) => {
 *   builder.setAdapter('mock', async () => recorder);
 * });
 *
 * const event = await recorder.waitForAnalytic('button-click');
 * expect(event.attributes?.section).toBe('header');
 * ```
 *
 * @packageDocumentation
 */
export {
  MockAnalyticsAdapter,
  type AnalyticsEventMatcher,
  type WaitForAnalyticOptions,
} from './MockAnalyticsAdapter.js';
