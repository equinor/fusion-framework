/**
 * Query-parameter key used to carry the context id in query-routing mode.
 *
 * The `$` prefix is a Fusion convention that namespaces framework-managed
 * parameters, distinguishing them from app-specific query params.
 */
export const CONTEXT_QUERY_PARAM_KEY = '$contextId';

/**
 * Regex matching a standard UUID (v4 format, case-insensitive).
 *
 * Used to identify whether a path segment is a context id vs. a route name.
 * Context ids in Fusion are always UUIDs, so this is a reliable discriminator.
 */
export const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
