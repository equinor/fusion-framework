import type { ApplicationInsightsAdapter } from './adapter';
export { ApplicationInsightsAdapter } from './adapter';

declare module '@equinor/fusion-framework-module-telemetry' {
  interface TelemetryAdapters {
    applicationInsights: ApplicationInsightsAdapter;
  }
}
