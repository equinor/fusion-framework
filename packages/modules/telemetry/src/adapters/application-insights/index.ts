/**
 * Application Insights telemetry adapter — forwards telemetry items to
 * Microsoft Application Insights for cloud-based monitoring and analytics.
 *
 * @remarks
 * Import from `@equinor/fusion-framework-module-telemetry/application-insights-adapter`.
 *
 * The module augments the `TelemetryAdapters` interface so that consumers can
 * reference the adapter by the well-known `applicationInsights` key.
 */
import type { ApplicationInsightsAdapter } from './adapter.js';
export { ApplicationInsightsAdapter } from './adapter.js';

declare module '@equinor/fusion-framework-module-telemetry' {
  interface TelemetryAdapters {
    applicationInsights: ApplicationInsightsAdapter;
  }
}
