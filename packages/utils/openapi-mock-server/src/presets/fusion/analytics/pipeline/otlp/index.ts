/**
 * Unwrapping OpenTelemetry (OTLP) `AnyValue`s and key-value lists into plain JSON, the way
 * Fusion's analytics pipeline does.
 *
 * @module
 */
export { flattenOtlpKeyValues } from './flatten-otlp-key-values.js';
export { flattenOtlpValue } from './flatten-otlp-value.js';
export { toOtlpAttributeMap } from './to-otlp-attribute-map.js';
