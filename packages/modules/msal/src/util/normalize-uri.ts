/**
 * Creates and normalizes a redirect URI.
 *
 * Resolves relative paths against the provided base URL and strips double and trailing slashes
 * from the resulting pathname. Used internally to sanitize redirect URIs before passing them
 * to MSAL authentication flows.
 *
 * @internal
 *
 * @param uri - Relative path (e.g. `/callback`) or absolute URL (e.g. `https://app.com/callback`)
 * @param home - Base URL for resolving relative paths. Defaults to `window.location.origin`.
 * @returns Fully-qualified, normalized URI string
 *
 * @example
 * ```typescript
 * normalizeUri('/callback');                  // https://current-origin.com/callback
 * normalizeUri('https://app.com//callback/'); // https://app.com/callback
 * ```
 */
export const normalizeUri = (uri: string, home: string = window.location.origin): string => {
  uri = uri.match(/^http[s]?/) ? uri : home + uri;
  const { origin, pathname } = new URL(uri);
  return origin + pathname.replace(/([^:]\/)\/+/g, '$1');
};
