/**
 * Creates and normalizes redirect uri.
 * Strips double and trailing slashes
 *
 * @internal
 *
 * @param uri - relative path or full url
 * @param home - base url for relative urls
 */
export const normalizeUri = (uri: string, home: string = window.location.origin): string => {
  uri = uri.match(/^http[s]?/) ? uri : home + uri;
  const { origin, pathname } = new URL(uri);
  return origin + pathname.replace(/([^:]\/)\/+/g, '$1');
};
