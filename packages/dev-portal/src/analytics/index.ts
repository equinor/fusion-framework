/**
 * Analytics in the dev portal: the portal's collectors and adapters, and sending analytics to the
 * mock Monitor service when the dev portal runs with `--mock`.
 *
 * @module
 */
export { configureAnalytics, type ConfigureAnalyticsOptions } from './configure-analytics.js';
export { resolveMockServerUrl } from './resolve-mock-server-url.js';
