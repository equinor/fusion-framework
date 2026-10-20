/**
 * Request-local marker excluding diagnostic delivery from operational instrumentation.
 * Symbol properties survive object spreads without becoming HTTP headers or serialized payload fields.
 */
export const diagnosticExclusion: unique symbol = Symbol('fusion.diagnostic-exclusion');
