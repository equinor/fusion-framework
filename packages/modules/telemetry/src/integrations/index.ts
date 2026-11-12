/**
 * Public `@equinor/fusion-framework-module-telemetry/integrations` entry point.
 *
 * Optional operational instrumentation for shared framework infrastructure. Each
 * integration resolves the telemetry provider lazily, so it never becomes a startup
 * dependency of the instrumented module.
 */
export { createHttpTelemetry } from './create-http-telemetry.js';
export type { HttpTelemetry } from './create-http-telemetry.js';
export { observeQueryTelemetry } from './observe-query-telemetry.js';
export type { QueryDiagnosticEvent } from './observe-query-telemetry.js';
