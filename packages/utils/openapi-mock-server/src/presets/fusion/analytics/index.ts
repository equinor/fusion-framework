/**
 * Fusion analytics in the mock server: receive what an app sends, read it the way Fusion's
 * analytics pipeline does, keep and record it, answer the app-feature events query, and let tests
 * check it.
 *
 * @remarks
 * Folders, by responsibility:
 * - `pipeline/` — OTLP → analytics records → event-table rows (`otlp/` unwrapping, `format/` rules).
 * - `store/` — received and seeded events, JSON Lines recordings.
 * - `query/` — the GraphQL `event_app_features` query.
 * - `identity/` — which user and session sent a request.
 * - `control/` — the `/@fusion-mock/analytics` control route.
 * - `services/` — the mock Monitor and Apps service definitions.
 * - `client/` — the `createMockAnalytics` test client, exported from the package root.
 *
 * @module
 */
export * from './pipeline/index.js';
export * from './query/index.js';
export * from './services/index.js';
export * from './store/index.js';
export type * from './types.js';
