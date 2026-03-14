/**
 * `@equinor/fusion-framework-module-analytics` — Fusion Framework module for
 * collecting and exporting application analytics using OpenTelemetry standards.
 *
 * @remarks
 * This package provides a pluggable adapter/collector architecture:
 *
 * - **Adapters** receive analytics events and forward them to a backend
 *   (e.g. console, OTLP endpoint).
 * - **Collectors** observe application state (context changes, app loads) and
 *   emit structured {@link AnalyticsEvent} instances.
 *
 * Import adapters from `'@equinor/fusion-framework-module-analytics/adapters'`,
 * collectors from `'@equinor/fusion-framework-module-analytics/collectors'`,
 * and log exporters from `'@equinor/fusion-framework-module-analytics/logExporters'`.
 *
 * @packageDocumentation
 */

export { module as analyticsModule, AnalyticsModule } from './module.js';

export { AnalyticsEvent, AnyValue, AnyValueMap } from './types.js';

export { AnalyticsProvider } from './AnalyticsProvider.js';
export { IAnalyticsProvider } from './AnalyticsProvider.interface.js';

export { AnalyticsConfig, IAnalyticsConfigurator } from './AnalyticsConfigurator.interface.js';
export { AnalyticsConfigurator } from './AnalyticsConfigurator.js';

export { enableAnalytics } from './enable-analytics.js';
