/**
 * Well-known route segment names used by the cookbook app.
 *
 * These segments are treated as static route prefixes and must never be
 * confused with dynamic context-id segments when parsing or generating URLs.
 */
export const STATIC_ROUTES = new Set(['route-a', 'route-b']);

/**
 * Regular expression matching a canonical GUID (8-4-4-4-12 hex format).
 *
 * Used to distinguish context-id segments from named route segments
 * when the path-based routing strategy embeds the context id as the
 * first URL segment.
 */
export const GUID_PATTERN =
  /^(?:(?:[0-9a-fA-F]){8}-(?:[0-9a-fA-F]){4}-(?:[0-9a-fA-F]){4}-(?:[0-9a-fA-F]){4}-(?:[0-9a-fA-F]){12})$/;
