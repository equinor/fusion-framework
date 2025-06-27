import type { ApplicationInsightsAdapter } from './adapter.js';
export { ApplicationInsightsAdapter } from './adapter.js';

declare module '@equinor/fusion-framework-module-telemetry' {
  interface TelemetryAdapters {
    applicationInsights: ApplicationInsightsAdapter;
  }
}
